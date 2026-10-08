```
4 // Create and configure the environment
5 ConfigurableEnvironment environment = getOrCreateEnvironment();
6 configureEnvironment(environment, applicationArguments.getSourceArgs());
7 listeners.environmentPrepared(environment); // 发送事件通知
org.springframework.context.ApplicationListener
8 bindToSpringApplication(environment);
9 if (this.webApplicationType == WebApplicationType.NONE) {
10 environment = new EnvironmentConverter(getClassLoader())
11 .convertToStandardEnvironmentIfNecessary(environment);
12 }
13 ConfigurationPropertySources.attach(environment);
14 return environment;
15 }
```

前面在springbootApplication实例化的时候加载了org.springframework.cloud.bootstrap.BootstrapApplicationListener 这 里发送environmentPrepared事件会触发加载配置

```
1 org.springframework.cloud.bootstrap.BootstrapApplicationListener#onApplicationEvent
2 {
3 ConfigurableEnvironment environment = event.getEnvironment();
4 if (!bootstrapEnabled(environment) && !useLegacyProcessing(environment)) {
5 return;
6 }
7 // don't listen to events in a bootstrap context
8 if (environment.getPropertySources().contains(BOOTSTRAP_PROPERTY_SOURCE_NAME)) {
9 return;
10 }
11 ConfigurableApplicationContext context = null;
12 String configName =
environment.resolvePlaceholders("${spring.cloud.bootstrap.name:bootstrap}");
13
14 srpingcloud有两个上下文（为什么要做两个呢？） 这里会去检测并新建一个
15 for (ApplicationContextInitializer<?> initializer :
event.getSpringApplication().getInitializers()) {
16 if (initializer instanceof ParentContextApplicationContextInitializer) {
17 context = findBootstrapContext((ParentContextApplicationContextInitializer)
initializer, configName);
18 }
19 }
20 if (context == null) {
21 context = bootstrapServiceContext(environment, event.getSpringApplication(),
configName); 核心是这个方法
```


```
28 bootstrapProperties.addLast(source);
29 }
30 // TODO: is it possible or sensible to share a ResourceLoader?
31 SpringApplicationBuilder builder = new
SpringApplicationBuilder().profiles(environment.getActiveProfiles())
32 .bannerMode(Mode.OFF)
33 .environment(bootstrapEnvironment)
34 // Don't use the default properties in this builder
35 .registerShutdownHook(false)
36 .logStartupInfo(false)
37 .web(WebApplicationType.NONE);
38 final SpringApplication builderApplication = builder.application();
39 if (builderApplication.getMainApplicationClass() == null &&
application.getMainApplicationClass() != null) {
40 // gh_425:
41 // SpringApplication cannot deduce the MainApplicationClass here
42 // if it is booted from SpringBootServletInitializer due to the
43 // absense of the "main" method in stackTraces.
44 // But luckily this method's second parameter "application" here
45 // carries the real MainApplicationClass which has been explicitly
46 // set by SpringBootServletInitializer itself already.
47 builder.main(application.getMainApplicationClass());
48 }
49 if (environment.getPropertySources().contains("refreshArgs")) {
50 // If we are doing a context refresh, really we only want to refresh the
51 // Environment, and there are some toxic listeners (like the
52 // LoggingApplicationListener) that affect global static state, so we need a
53 // way to switch those off.
54
builderApplication.setListeners(filterListeners(builderApplication.getListeners()));
55 }
56 builder.sources(BootstrapImportSelectorConfiguration.class);
57 final ConfigurableApplicationContext context = builder.run();
58 // gh-214 using spring.application.name=bootstrap to set the context id via
59 // `ContextIdApplicationContextInitializer` prevents apps from getting the actual
60 // spring.application.name
61 // during the bootstrap phase.
62 context.setId("bootstrap");
63 // Make the bootstrap context a parent of the app context
64 addAncestorInitializer(application, context);
65 // It only has properties in it now that we don't want in the parent so remove
66 // it (and it will be added back later)
67 bootstrapProperties.remove(BOOTSTRAP_PROPERTY_SOURCE_NAME);
```


```
4 SpringFactoriesLoader.loadFactoryNames(BootstrapConfiguration.class,
classLoader));
5 ....
6 }
```

这里会去读 spring.factories 里面等号前是 org.springframework.cloud.bootstrap.BootstrapConfiguration的值了（这里读 的其实是缓存了,在开始的 setInitializers((Collection) getSpringFactoriesInstances(ApplicationContextInitializer.class)); 地方就已经全部加载好了）

这里会读两段配置 一段配置来自SpringCloud 一段配置来自nacos（当然还有其他框架配置 这里不做讨论）

## 2、springcloud核心配置类

这是springcloud的配置 真正干活的类是

## 2、nacos核心配置类

## 3、加载nacos配置

PropertySourceBootstrapConfiguration是实现了ApplicationContextInitializer这个方法的所以在新 springbootApplication的run方法里面 会被触发initialize方法

- 1 public class PropertySourceBootstrapConfiguration implements ApplicationListener<ContextRefreshedEvent>,

- 2 ApplicationContextInitializer<ConfigurableApplicationContext>, Ordered {


```
43 String logConfig = environment.resolvePlaceholders("\${logging.config:}");
44 LogFile logFile = LogFile.get(environment);
45 for (PropertySource<?> p : environment.getPropertySources()) {
46 if (p.getName().startsWith(BOOTSTRAP_PROPERTY_SOURCE_NAME)) {
47 propertySources.remove(p.getName());
48 }
49 }
50 insertPropertySources(propertySources, composite);
51 reinitializeLoggingSystem(environment);
52 setLogLevels(applicationContext, environment);
53 handleProfiles(environment);
54 }
55 } }
```

## 1、nacos核心类被注入

PropertySourceBootstrapConfiguration的属性propertySourceLocators 会把nacos里面的NacosPropertySourceLocator 自动加载进来

## 2、框架触发调用

Collection<PropertySource<?>> source = locator.locateCollection(environment); 在这行里面 将nacos的配置读取到新 的environment里面

## 6、总结

- 1、 springcloud是基于springboot进行构建的 所以要参与到springboot的流程中，需要通过springboot的留给外部的扩展 点 这里选择了spring.factories配置文件且是通过org.springframework.context.ApplicationListener这个配置属性接入的

- 2、nacos作为服务想要进入springcloud的体系需要依赖springcloud的扩展点 这里nacos依然使用了spring.factories配置 文件 同时实现的springcloud要求的接口PropertySourceLocator 然后将自己的东西给到了springcloud

- 3、本身nacos可直接对接springboot 对接用的是beanFactotyProcessor的规范 但是没啥必要

- 4、springcloud或者springboot 对接其他框架都是基于 这些扩展点

## 下一篇： springcloud 如何感知nacos配置中心配置的变更
