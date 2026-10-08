

# 1、maven依赖

```
<dependency>
   <groupId>org.springframework.cloud</groupId>
   <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId> 
    <version>{lastVersion}</version>
 </dependency>
```



# 2、主要配置文件
![主要配置文件](https://i.imgur.com/Eofz1QG.png)
```
org.springframework.cloud.bootstrap.BootstrapConfiguration=\\ 
### 主要是这行
org.springframework.cloud.alibaba.nacos.NacosConfigBootstrapConfiguration 


org.springframework.boot.autoconfigure.EnableAutoConfiguration=\\ 
org.springframework.cloud.alibaba.nacos.NacosConfigAutoConfiguration,\\ 
org.springframework.cloud.alibaba.nacos.endpoint.NacosConfigEndpointAutoConfiguration

org.springframework.boot.diagnostics.FailureAnalyzer=\\ 
org.springframework.cloud.alibaba.nacos.diagnostics.analyzer.NacosConnectionFailureAnalyzer
```

# 3、主要的类

```
@Configuration
public class NacosConfigBootstrapConfiguration {

    @Bean // 主要是这个类在干活
    public NacosPropertySourceLocator nacosPropertySourceLocator() {
       return new NacosPropertySourceLocator();
    }

    @Bean
    @ConditionalOnMissingBean
    public NacosConfigProperties nacosConfigProperties() {
       return new NacosConfigProperties();
    }

}
```

# 4、nacos接入springcloud的核心类

```
public class NacosPropertySourceLocator implements PropertySourceLocator{
    ...
    // 真正加载配置的地方  这个方法 由springcloud 发起调用 具体流程在下面
    @Override 
    public PropertySource<?> locate(Environment env) {
     ....
    }
    ...
}
```

# 5、基于springcloud 加载nacos配置的实际执行流程


## 1、springboot项目的main方法调用
>org.springframework.boot.SpringApplication#run(java.lang.Class, java.lang.String...)

## 2、SpringApplication的实例化方法
>org.springframework.boot.SpringApplication#SpringApplication(org.springframework.core.io.ResourceLoader, java.lang.Class...) 
```
      {
       这里最核心的就是去读spring.factories的配置文件 后续springcloud的所有扩展 都是从这里进去的
       这里会一次性读取所有文件 后续读的其实都是缓存了
             .....
       setInitializers(
        (Collection) getSpringFactoriesInstances(ApplicationContextInitializer.class)
        );   
       setListeners(
        (Collection) getSpringFactoriesInstances(ApplicationListener.class)
        );  
             .....  
      }
```

## 3、触发加载springbootcloud的配置

```
setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class)); 
 
```
>这个方法会读到springcloud包下
![](https://i.imgur.com/FftxsGY.png)
```
Application Listeners
org.springframework.context.ApplicationListener=\
 这个就是干活的地方
org.springframework.cloud.bootstrap.BootstrapApplicationListener,\  
org.springframework.cloud.bootstrap.LoggingSystemShutdownListener,\
org.springframework.cloud.context.restart.RestartListener

Spring Cloud Bootstrap components
org.springframework.cloud.bootstrap.BootstrapConfiguration=\
org.springframework.cloud.bootstrap.config.PropertySourceBootstrapConfiguration,\
org.springframework.cloud.bootstrap.encrypt.EncryptionBootstrapConfiguration,\
org.springframework.cloud.autoconfigure.ConfigurationPropertiesRebinderAutoConfiguration,\
org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration

Spring Boot BootstrapRegistryInitializer
org.springframework.boot.bootstrap.BootstrapRegistryInitializer=\
org.springframework.cloud.bootstrap.RefreshBootstrapRegistryInitializer,\
org.springframework.cloud.bootstrap.TextEncryptorConfigBootstrapper

Environment Post Processors
org.springframework.boot.EnvironmentPostProcessor=\
org.springframework.cloud.bootstrap.BootstrapConfigFileApplicationListener,\
org.springframework.cloud.bootstrap.encrypt.DecryptEnvironmentPostProcessor,\
org.springframework.cloud.util.random.CachedRandomPropertySourceEnvironmentPostProcessor
```
## 4、主服务准备environment

```
org.springframework.boot.SpringApplication#run(java.lang.String...) {
.....
ConfigurableEnvironment environment = prepareEnvironment(listeners, applicationArguments);
.....
}
```

## 5、listeners发送environmentPrepared事件

```
private ConfigurableEnvironment prepareEnvironment(
       SpringApplicationRunListeners listeners,
       ApplicationArguments applicationArguments) {
    // Create and configure the environment
    ConfigurableEnvironment environment = getOrCreateEnvironment();
    configureEnvironment(environment, applicationArguments.getSourceArgs());
    listeners.environmentPrepared(environment);  // 发送事件通知org.springframework.context.ApplicationListener 
    bindToSpringApplication(environment);
    if (this.webApplicationType == WebApplicationType.NONE) {
       environment = new EnvironmentConverter(getClassLoader())
             .convertToStandardEnvironmentIfNecessary(environment);
    }
    ConfigurationPropertySources.attach(environment);
    return environment;
}
```

前面在springbootApplication实例化的时候加载了org.springframework.cloud.bootstrap.BootstrapApplicationListener   
这里发送environmentPrepared事件会触发加载配置

```
org.springframework.cloud.bootstrap.BootstrapApplicationListener#onApplicationEvent
{
    ConfigurableEnvironment environment = event.getEnvironment();
    if (!bootstrapEnabled(environment) && !useLegacyProcessing(environment)) {
       return;
    }
    // don't listen to events in a bootstrap context
    if (environment.getPropertySources().contains(BOOTSTRAP_PROPERTY_SOURCE_NAME)) {
       return;
    }
    ConfigurableApplicationContext context = null;
    String configName = environment.resolvePlaceholders("${spring.cloud.bootstrap.name:bootstrap}");
   
    srpingcloud有两个上下文（为什么要做两个呢？） 这里会去检测并新建一个 
      for (ApplicationContextInitializer<?> initializer : event.getSpringApplication().getInitializers()) {
       if (initializer instanceof ParentContextApplicationContextInitializer) {
          context = findBootstrapContext((ParentContextApplicationContextInitializer) initializer, configName);
       }
    }
    if (context == null) {
       context = bootstrapServiceContext(environment, event.getSpringApplication(), configName);  核心是这个方法
       event.getSpringApplication().addListeners(new CloseContextOnFailureApplicationListener(context));
    }
    

    apply(context, event.getSpringApplication(), environment);
}
```

## 6、新的SringApplication和新的Environment


```
private ConfigurableApplicationContext bootstrapServiceContext(ConfigurableEnvironment environment,
       final SpringApplication application, String configName) {
    ConfigurableEnvironment bootstrapEnvironment = new AbstractEnvironment() {
    };
    MutablePropertySources bootstrapProperties = bootstrapEnvironment.getPropertySources();
    String configLocation = environment.resolvePlaceholders("${spring.cloud.bootstrap.location:}");
    String configAdditionalLocation = environment
       .resolvePlaceholders("${spring.cloud.bootstrap.additional-location:}");
    Map<String, Object> bootstrapMap = new HashMap<>();
    bootstrapMap.put("spring.config.name", configName);
    // if an app (or test) uses spring.main.web-application-type=reactive, bootstrap
    // will fail
    // force the environment to use none, because if though it is set below in the
    // builder
    // the environment overrides it
    bootstrapMap.put("spring.main.web-application-type", "none");
    if (StringUtils.hasText(configLocation)) {
       bootstrapMap.put("spring.config.location", configLocation);
    }
    if (StringUtils.hasText(configAdditionalLocation)) {
       bootstrapMap.put("spring.config.additional-location", configAdditionalLocation);
    }
    bootstrapProperties.addFirst(new MapPropertySource(BOOTSTRAP_PROPERTY_SOURCE_NAME, bootstrapMap));
    for (PropertySource<?> source : environment.getPropertySources()) {
       if (source instanceof StubPropertySource) {
          continue;
       }
       bootstrapProperties.addLast(source);
    }
    // TODO: is it possible or sensible to share a ResourceLoader?
    SpringApplicationBuilder builder = new SpringApplicationBuilder().profiles(environment.getActiveProfiles())
       .bannerMode(Mode.OFF)
       .environment(bootstrapEnvironment)
       // Don't use the default properties in this builder
       .registerShutdownHook(false)
       .logStartupInfo(false)
       .web(WebApplicationType.NONE);
    final SpringApplication builderApplication = builder.application();
    if (builderApplication.getMainApplicationClass() == null && application.getMainApplicationClass() != null) {
       // gh_425:
       // SpringApplication cannot deduce the MainApplicationClass here
       // if it is booted from SpringBootServletInitializer due to the
       // absense of the "main" method in stackTraces.
       // But luckily this method's second parameter "application" here
       // carries the real MainApplicationClass which has been explicitly
       // set by SpringBootServletInitializer itself already.
       builder.main(application.getMainApplicationClass());
    }
    if (environment.getPropertySources().contains("refreshArgs")) {
       // If we are doing a context refresh, really we only want to refresh the
       // Environment, and there are some toxic listeners (like the
       // LoggingApplicationListener) that affect global static state, so we need a
       // way to switch those off.
       builderApplication.setListeners(filterListeners(builderApplication.getListeners()));
    }
    builder.sources(BootstrapImportSelectorConfiguration.class);
    final ConfigurableApplicationContext context = builder.run();
    // gh-214 using spring.application.name=bootstrap to set the context id via
    // `ContextIdApplicationContextInitializer` prevents apps from getting the actual
    // spring.application.name
    // during the bootstrap phase.
    context.setId("bootstrap");
    // Make the bootstrap context a parent of the app context
    addAncestorInitializer(application, context);
    // It only has properties in it now that we don't want in the parent so remove
    // it (and it will be added back later)
    bootstrapProperties.remove(BOOTSTRAP_PROPERTY_SOURCE_NAME);
    mergeDefaultProperties(environment.getPropertySources(), bootstrapProperties);
    return context;
}

```

上面的方法 做了下面几件事

### 1、构建新的SpringApplication

设置web类型为WebApplicationType.NONE避免处理额外的逻辑   
从这里开始 *__后续的所有逻辑都发生在新的SpringApplication中旧的还卡在 listeners.environmentPrepared(environment)这一行__*

### 2、配置新的ConfigurableEnvironment

同时加入一个标记 *__BOOTSTRAP_PROPERTY_SOURCE_NAME__* 后面一些逻辑的触发这个会是执行的开关

### 3、复制数据

复制旧的ConfigurableEnvironment里面的数据到ConfigurableEnvironment

### 4、设置source为 BootstrapImportSelectorConfiguration.clase

这个执行流程去看下ConfigurationClassPostProcessor这个是spring4的时候就有了  这里会注入springcloud的核心配置类

### 5、执行新的上下文的初始化

这里设置后会执行final ConfigurableApplicationContext context = builder.run();会执行新的上下文的初始化
```
@Configuration(proxyBeanMethods = false) 
@Import(BootstrapImportSelector.class) 
public class BootstrapImportSelectorConfiguration {  

}
```
### 6、加载nacos配置到新的 SpringApplication中

#### 1、springcloud配置类加载
```
org.springframework.cloud.bootstrap.BootstrapImportSelector#selectImports { 
    ... 
    List<String> names = new ArrayList<>(
         SpringFactoriesLoader.loadFactoryNames(BootstrapConfiguration.class, classLoader)
         );
     .... 
     }
```
这里会去读 ***spring.factories*** 里面等号前是 ***org.springframework.cloud.bootstrap.BootstrapConfiguration***的值了
>（这里读的其实是缓存了,在开始的setInitializers((Collection)getSpringFactoriesInstances(ApplicationContextInitializer.class))地方就已经全部加载好了）

这里会读两段配置 一段配置来自SpringCloud 一段配置来自nacos（当然还有其他框架配置 这里不做讨论）

#### 2、springcloud核心配置类

这是springcloud的配置 真正干活的类是

![springcloud核心配置类](https://i.imgur.com/bYohCRs.png)

#### 3、nacos核心配置类
![nacos核心配置类](https://i.imgur.com/usiS9DJ.png)

#### 4、加载nacos配置

PropertySourceBootstrapConfiguration是实现了ApplicationContextInitializer这个方法的所以在新springbootApplication的run方法里面会被触发initialize方法
```
public class PropertySourceBootstrapConfiguration implements ApplicationListener<ContextRefreshedEvent>,
       ApplicationContextInitializer<ConfigurableApplicationContext>, Ordered {
         @Override

这个就是nacos加入springcloud这个大家庭的地方 会被框架自动注入进来
@Autowired(required = false)
private List<PropertySourceLocator> propertySourceLocators = new ArrayList<>();

public void initialize(ConfigurableApplicationContext applicationContext) {
    if (!bootstrapProperties.isInitializeOnContextRefresh() 
    || !applicationContext.getEnvironment()
        .getPropertySources()
        .contains(BootstrapApplicationListener.BOOTSTRAP_PROPERTY_SOURCE_NAME)) 
        // BOOTSTRAP_PROPERTY_SOURCE_NAME 开关控制是是否拉取数据
     {
       doInitialize(applicationContext);
    }
}


private void doInitialize(ConfigurableApplicationContext applicationContext) {
    List<PropertySource<?>> composite = new ArrayList<>();
    AnnotationAwareOrderComparator.sort(this.propertySourceLocators);
    boolean empty = true;
    ConfigurableEnvironment environment = applicationContext.getEnvironment();
    for (PropertySourceLocator locator : this.propertySourceLocators) {
       Collection<PropertySource<?>> source = locator.locateCollection(environment);
       if (source == null || source.size() == 0) {
          continue;
       }
       List<PropertySource<?>> sourceList = new ArrayList<>();
       for (PropertySource<?> p : source) {
          if (p instanceof EnumerablePropertySource<?> enumerable) {
             sourceList.add(new BootstrapPropertySource<>(enumerable));
          }
          else {
             sourceList.add(new SimpleBootstrapPropertySource(p));
          }
       }
       logger.info("Located property source: " + sourceList);
       composite.addAll(sourceList);
       empty = false;
    }
    if (!empty) {
       MutablePropertySources propertySources = environment.getPropertySources();
       String logConfig = environment.resolvePlaceholders("${logging.config:}");
       LogFile logFile = LogFile.get(environment);
       for (PropertySource<?> p : environment.getPropertySources()) {
          if (p.getName().startsWith(BOOTSTRAP_PROPERTY_SOURCE_NAME)) {
             propertySources.remove(p.getName());
          }
       }
       insertPropertySources(propertySources, composite);
       reinitializeLoggingSystem(environment);
       setLogLevels(applicationContext, environment);
       handleProfiles(environment);
    }
}  }
```

##### 1、nacos核心类被注入

PropertySourceBootstrapConfiguration的属性propertySourceLocators会把nacos里面的NacosPropertySourceLocator自动加载进来

##### 2、框架触发调用
```
Collection> source = locator.locateCollection(environment); 在这行里面 将nacos的配置读取到新的environment里面
```
# 6、总结

+  springcloud是基于springboot进行构建的 所以要参与到springboot的流程中，需要通过springboot的留给外部的扩展点 这里选择了spring.factories配置文件且是通过org.springframework.context.ApplicationListener这个配置属性接入的

+ nacos作为服务想要进入springcloud的体系需要依赖springcloud的扩展点 这里nacos依然使用了spring.factories配置文件 同时实现的springcloud要求的接口PropertySourceLocator 然后将自己的东西给到了springcloud

+ 本身nacos可直接对接springboot 对接用的是beanFactotyProcessor的规范 但是没啥必要

+ springcloud或者springboot 对接其他框架都是基于 这些扩展点


