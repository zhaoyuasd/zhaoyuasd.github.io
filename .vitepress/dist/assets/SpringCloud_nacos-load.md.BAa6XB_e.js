import{_ as a,o as s,c as p,a2 as e}from"./chunks/framework.D66Xq0Kv.js";const d=JSON.parse('{"title":"1、maven依赖","description":"","frontmatter":{},"headers":[],"relativePath":"SpringCloud/nacos-load.md","filePath":"SpringCloud/nacos-load.md"}'),i={name:"SpringCloud/nacos-load.md"};function o(t,n,l,r,c,g){return s(),p("div",null,[...n[0]||(n[0]=[e(`<h1 id="_1、maven依赖" tabindex="-1">1、maven依赖 <a class="header-anchor" href="#_1、maven依赖" aria-label="Permalink to &quot;1、maven依赖&quot;">​</a></h1><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>   &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;</span></span>
<span class="line"><span>   &lt;artifactId&gt;spring-cloud-starter-alibaba-nacos-config&lt;/artifactId&gt; </span></span>
<span class="line"><span>    &lt;version&gt;{lastVersion}&lt;/version&gt;</span></span>
<span class="line"><span> &lt;/dependency&gt;</span></span></code></pre></div><h1 id="_2、主要配置文件" tabindex="-1">2、主要配置文件 <a class="header-anchor" href="#_2、主要配置文件" aria-label="Permalink to &quot;2、主要配置文件&quot;">​</a></h1><p><img src="https://i.imgur.com/Eofz1QG.png" alt="主要配置文件"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>org.springframework.cloud.bootstrap.BootstrapConfiguration=\\\\ </span></span>
<span class="line"><span>### 主要是这行</span></span>
<span class="line"><span>org.springframework.cloud.alibaba.nacos.NacosConfigBootstrapConfiguration </span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>org.springframework.boot.autoconfigure.EnableAutoConfiguration=\\\\ </span></span>
<span class="line"><span>org.springframework.cloud.alibaba.nacos.NacosConfigAutoConfiguration,\\\\ </span></span>
<span class="line"><span>org.springframework.cloud.alibaba.nacos.endpoint.NacosConfigEndpointAutoConfiguration</span></span>
<span class="line"><span></span></span>
<span class="line"><span>org.springframework.boot.diagnostics.FailureAnalyzer=\\\\ </span></span>
<span class="line"><span>org.springframework.cloud.alibaba.nacos.diagnostics.analyzer.NacosConnectionFailureAnalyzer</span></span></code></pre></div><h1 id="_3、主要的类" tabindex="-1">3、主要的类 <a class="header-anchor" href="#_3、主要的类" aria-label="Permalink to &quot;3、主要的类&quot;">​</a></h1><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class NacosConfigBootstrapConfiguration {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Bean // 主要是这个类在干活</span></span>
<span class="line"><span>    public NacosPropertySourceLocator nacosPropertySourceLocator() {</span></span>
<span class="line"><span>       return new NacosPropertySourceLocator();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Bean</span></span>
<span class="line"><span>    @ConditionalOnMissingBean</span></span>
<span class="line"><span>    public NacosConfigProperties nacosConfigProperties() {</span></span>
<span class="line"><span>       return new NacosConfigProperties();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><h1 id="_4、nacos接入springcloud的核心类" tabindex="-1">4、nacos接入springcloud的核心类 <a class="header-anchor" href="#_4、nacos接入springcloud的核心类" aria-label="Permalink to &quot;4、nacos接入springcloud的核心类&quot;">​</a></h1><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class NacosPropertySourceLocator implements PropertySourceLocator{</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    // 真正加载配置的地方  这个方法 由springcloud 发起调用 具体流程在下面</span></span>
<span class="line"><span>    @Override </span></span>
<span class="line"><span>    public PropertySource&lt;?&gt; locate(Environment env) {</span></span>
<span class="line"><span>     ....</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>}</span></span></code></pre></div><h1 id="_5、基于springcloud-加载nacos配置的实际执行流程" tabindex="-1">5、基于springcloud 加载nacos配置的实际执行流程 <a class="header-anchor" href="#_5、基于springcloud-加载nacos配置的实际执行流程" aria-label="Permalink to &quot;5、基于springcloud 加载nacos配置的实际执行流程&quot;">​</a></h1><h2 id="_1、springboot项目的main方法调用" tabindex="-1">1、springboot项目的main方法调用 <a class="header-anchor" href="#_1、springboot项目的main方法调用" aria-label="Permalink to &quot;1、springboot项目的main方法调用&quot;">​</a></h2><blockquote><p>org.springframework.boot.SpringApplication#run(java.lang.Class, java.lang.String...)</p></blockquote><h2 id="_2、springapplication的实例化方法" tabindex="-1">2、SpringApplication的实例化方法 <a class="header-anchor" href="#_2、springapplication的实例化方法" aria-label="Permalink to &quot;2、SpringApplication的实例化方法&quot;">​</a></h2><blockquote><p>org.springframework.boot.SpringApplication#SpringApplication(org.springframework.core.io.ResourceLoader, java.lang.Class...)</p></blockquote><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>      {</span></span>
<span class="line"><span>       这里最核心的就是去读spring.factories的配置文件 后续springcloud的所有扩展 都是从这里进去的</span></span>
<span class="line"><span>       这里会一次性读取所有文件 后续读的其实都是缓存了</span></span>
<span class="line"><span>             .....</span></span>
<span class="line"><span>       setInitializers(</span></span>
<span class="line"><span>        (Collection) getSpringFactoriesInstances(ApplicationContextInitializer.class)</span></span>
<span class="line"><span>        );   </span></span>
<span class="line"><span>       setListeners(</span></span>
<span class="line"><span>        (Collection) getSpringFactoriesInstances(ApplicationListener.class)</span></span>
<span class="line"><span>        );  </span></span>
<span class="line"><span>             .....  </span></span>
<span class="line"><span>      }</span></span></code></pre></div><h2 id="_3、触发加载springbootcloud的配置" tabindex="-1">3、触发加载springbootcloud的配置 <a class="header-anchor" href="#_3、触发加载springbootcloud的配置" aria-label="Permalink to &quot;3、触发加载springbootcloud的配置&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class));</span></span></code></pre></div><blockquote><p>这个方法会读到springcloud包下 <img src="https://i.imgur.com/FftxsGY.png" alt=""></p></blockquote><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Application Listeners</span></span>
<span class="line"><span>org.springframework.context.ApplicationListener=\\</span></span>
<span class="line"><span> 这个就是干活的地方</span></span>
<span class="line"><span>org.springframework.cloud.bootstrap.BootstrapApplicationListener,\\  </span></span>
<span class="line"><span>org.springframework.cloud.bootstrap.LoggingSystemShutdownListener,\\</span></span>
<span class="line"><span>org.springframework.cloud.context.restart.RestartListener</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Spring Cloud Bootstrap components</span></span>
<span class="line"><span>org.springframework.cloud.bootstrap.BootstrapConfiguration=\\</span></span>
<span class="line"><span>org.springframework.cloud.bootstrap.config.PropertySourceBootstrapConfiguration,\\</span></span>
<span class="line"><span>org.springframework.cloud.bootstrap.encrypt.EncryptionBootstrapConfiguration,\\</span></span>
<span class="line"><span>org.springframework.cloud.autoconfigure.ConfigurationPropertiesRebinderAutoConfiguration,\\</span></span>
<span class="line"><span>org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Spring Boot BootstrapRegistryInitializer</span></span>
<span class="line"><span>org.springframework.boot.bootstrap.BootstrapRegistryInitializer=\\</span></span>
<span class="line"><span>org.springframework.cloud.bootstrap.RefreshBootstrapRegistryInitializer,\\</span></span>
<span class="line"><span>org.springframework.cloud.bootstrap.TextEncryptorConfigBootstrapper</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Environment Post Processors</span></span>
<span class="line"><span>org.springframework.boot.EnvironmentPostProcessor=\\</span></span>
<span class="line"><span>org.springframework.cloud.bootstrap.BootstrapConfigFileApplicationListener,\\</span></span>
<span class="line"><span>org.springframework.cloud.bootstrap.encrypt.DecryptEnvironmentPostProcessor,\\</span></span>
<span class="line"><span>org.springframework.cloud.util.random.CachedRandomPropertySourceEnvironmentPostProcessor</span></span></code></pre></div><h2 id="_4、主服务准备environment" tabindex="-1">4、主服务准备environment <a class="header-anchor" href="#_4、主服务准备environment" aria-label="Permalink to &quot;4、主服务准备environment&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>org.springframework.boot.SpringApplication#run(java.lang.String...) {</span></span>
<span class="line"><span>.....</span></span>
<span class="line"><span>ConfigurableEnvironment environment = prepareEnvironment(listeners, applicationArguments);</span></span>
<span class="line"><span>.....</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_5、listeners发送environmentprepared事件" tabindex="-1">5、listeners发送environmentPrepared事件 <a class="header-anchor" href="#_5、listeners发送environmentprepared事件" aria-label="Permalink to &quot;5、listeners发送environmentPrepared事件&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private ConfigurableEnvironment prepareEnvironment(</span></span>
<span class="line"><span>       SpringApplicationRunListeners listeners,</span></span>
<span class="line"><span>       ApplicationArguments applicationArguments) {</span></span>
<span class="line"><span>    // Create and configure the environment</span></span>
<span class="line"><span>    ConfigurableEnvironment environment = getOrCreateEnvironment();</span></span>
<span class="line"><span>    configureEnvironment(environment, applicationArguments.getSourceArgs());</span></span>
<span class="line"><span>    listeners.environmentPrepared(environment);  // 发送事件通知org.springframework.context.ApplicationListener </span></span>
<span class="line"><span>    bindToSpringApplication(environment);</span></span>
<span class="line"><span>    if (this.webApplicationType == WebApplicationType.NONE) {</span></span>
<span class="line"><span>       environment = new EnvironmentConverter(getClassLoader())</span></span>
<span class="line"><span>             .convertToStandardEnvironmentIfNecessary(environment);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ConfigurationPropertySources.attach(environment);</span></span>
<span class="line"><span>    return environment;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>前面在springbootApplication实例化的时候加载了org.springframework.cloud.bootstrap.BootstrapApplicationListener<br> 这里发送environmentPrepared事件会触发加载配置</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>org.springframework.cloud.bootstrap.BootstrapApplicationListener#onApplicationEvent</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>    ConfigurableEnvironment environment = event.getEnvironment();</span></span>
<span class="line"><span>    if (!bootstrapEnabled(environment) &amp;&amp; !useLegacyProcessing(environment)) {</span></span>
<span class="line"><span>       return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // don&#39;t listen to events in a bootstrap context</span></span>
<span class="line"><span>    if (environment.getPropertySources().contains(BOOTSTRAP_PROPERTY_SOURCE_NAME)) {</span></span>
<span class="line"><span>       return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ConfigurableApplicationContext context = null;</span></span>
<span class="line"><span>    String configName = environment.resolvePlaceholders(&quot;\${spring.cloud.bootstrap.name:bootstrap}&quot;);</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>    srpingcloud有两个上下文（为什么要做两个呢？） 这里会去检测并新建一个 </span></span>
<span class="line"><span>      for (ApplicationContextInitializer&lt;?&gt; initializer : event.getSpringApplication().getInitializers()) {</span></span>
<span class="line"><span>       if (initializer instanceof ParentContextApplicationContextInitializer) {</span></span>
<span class="line"><span>          context = findBootstrapContext((ParentContextApplicationContextInitializer) initializer, configName);</span></span>
<span class="line"><span>       }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (context == null) {</span></span>
<span class="line"><span>       context = bootstrapServiceContext(environment, event.getSpringApplication(), configName);  核心是这个方法</span></span>
<span class="line"><span>       event.getSpringApplication().addListeners(new CloseContextOnFailureApplicationListener(context));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span></span></span>
<span class="line"><span>    apply(context, event.getSpringApplication(), environment);</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_6、新的sringapplication和新的environment" tabindex="-1">6、新的SringApplication和新的Environment <a class="header-anchor" href="#_6、新的sringapplication和新的environment" aria-label="Permalink to &quot;6、新的SringApplication和新的Environment&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private ConfigurableApplicationContext bootstrapServiceContext(ConfigurableEnvironment environment,</span></span>
<span class="line"><span>       final SpringApplication application, String configName) {</span></span>
<span class="line"><span>    ConfigurableEnvironment bootstrapEnvironment = new AbstractEnvironment() {</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>    MutablePropertySources bootstrapProperties = bootstrapEnvironment.getPropertySources();</span></span>
<span class="line"><span>    String configLocation = environment.resolvePlaceholders(&quot;\${spring.cloud.bootstrap.location:}&quot;);</span></span>
<span class="line"><span>    String configAdditionalLocation = environment</span></span>
<span class="line"><span>       .resolvePlaceholders(&quot;\${spring.cloud.bootstrap.additional-location:}&quot;);</span></span>
<span class="line"><span>    Map&lt;String, Object&gt; bootstrapMap = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>    bootstrapMap.put(&quot;spring.config.name&quot;, configName);</span></span>
<span class="line"><span>    // if an app (or test) uses spring.main.web-application-type=reactive, bootstrap</span></span>
<span class="line"><span>    // will fail</span></span>
<span class="line"><span>    // force the environment to use none, because if though it is set below in the</span></span>
<span class="line"><span>    // builder</span></span>
<span class="line"><span>    // the environment overrides it</span></span>
<span class="line"><span>    bootstrapMap.put(&quot;spring.main.web-application-type&quot;, &quot;none&quot;);</span></span>
<span class="line"><span>    if (StringUtils.hasText(configLocation)) {</span></span>
<span class="line"><span>       bootstrapMap.put(&quot;spring.config.location&quot;, configLocation);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (StringUtils.hasText(configAdditionalLocation)) {</span></span>
<span class="line"><span>       bootstrapMap.put(&quot;spring.config.additional-location&quot;, configAdditionalLocation);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    bootstrapProperties.addFirst(new MapPropertySource(BOOTSTRAP_PROPERTY_SOURCE_NAME, bootstrapMap));</span></span>
<span class="line"><span>    for (PropertySource&lt;?&gt; source : environment.getPropertySources()) {</span></span>
<span class="line"><span>       if (source instanceof StubPropertySource) {</span></span>
<span class="line"><span>          continue;</span></span>
<span class="line"><span>       }</span></span>
<span class="line"><span>       bootstrapProperties.addLast(source);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // TODO: is it possible or sensible to share a ResourceLoader?</span></span>
<span class="line"><span>    SpringApplicationBuilder builder = new SpringApplicationBuilder().profiles(environment.getActiveProfiles())</span></span>
<span class="line"><span>       .bannerMode(Mode.OFF)</span></span>
<span class="line"><span>       .environment(bootstrapEnvironment)</span></span>
<span class="line"><span>       // Don&#39;t use the default properties in this builder</span></span>
<span class="line"><span>       .registerShutdownHook(false)</span></span>
<span class="line"><span>       .logStartupInfo(false)</span></span>
<span class="line"><span>       .web(WebApplicationType.NONE);</span></span>
<span class="line"><span>    final SpringApplication builderApplication = builder.application();</span></span>
<span class="line"><span>    if (builderApplication.getMainApplicationClass() == null &amp;&amp; application.getMainApplicationClass() != null) {</span></span>
<span class="line"><span>       // gh_425:</span></span>
<span class="line"><span>       // SpringApplication cannot deduce the MainApplicationClass here</span></span>
<span class="line"><span>       // if it is booted from SpringBootServletInitializer due to the</span></span>
<span class="line"><span>       // absense of the &quot;main&quot; method in stackTraces.</span></span>
<span class="line"><span>       // But luckily this method&#39;s second parameter &quot;application&quot; here</span></span>
<span class="line"><span>       // carries the real MainApplicationClass which has been explicitly</span></span>
<span class="line"><span>       // set by SpringBootServletInitializer itself already.</span></span>
<span class="line"><span>       builder.main(application.getMainApplicationClass());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (environment.getPropertySources().contains(&quot;refreshArgs&quot;)) {</span></span>
<span class="line"><span>       // If we are doing a context refresh, really we only want to refresh the</span></span>
<span class="line"><span>       // Environment, and there are some toxic listeners (like the</span></span>
<span class="line"><span>       // LoggingApplicationListener) that affect global static state, so we need a</span></span>
<span class="line"><span>       // way to switch those off.</span></span>
<span class="line"><span>       builderApplication.setListeners(filterListeners(builderApplication.getListeners()));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    builder.sources(BootstrapImportSelectorConfiguration.class);</span></span>
<span class="line"><span>    final ConfigurableApplicationContext context = builder.run();</span></span>
<span class="line"><span>    // gh-214 using spring.application.name=bootstrap to set the context id via</span></span>
<span class="line"><span>    // \`ContextIdApplicationContextInitializer\` prevents apps from getting the actual</span></span>
<span class="line"><span>    // spring.application.name</span></span>
<span class="line"><span>    // during the bootstrap phase.</span></span>
<span class="line"><span>    context.setId(&quot;bootstrap&quot;);</span></span>
<span class="line"><span>    // Make the bootstrap context a parent of the app context</span></span>
<span class="line"><span>    addAncestorInitializer(application, context);</span></span>
<span class="line"><span>    // It only has properties in it now that we don&#39;t want in the parent so remove</span></span>
<span class="line"><span>    // it (and it will be added back later)</span></span>
<span class="line"><span>    bootstrapProperties.remove(BOOTSTRAP_PROPERTY_SOURCE_NAME);</span></span>
<span class="line"><span>    mergeDefaultProperties(environment.getPropertySources(), bootstrapProperties);</span></span>
<span class="line"><span>    return context;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>上面的方法 做了下面几件事</p><h3 id="_1、构建新的springapplication" tabindex="-1">1、构建新的SpringApplication <a class="header-anchor" href="#_1、构建新的springapplication" aria-label="Permalink to &quot;1、构建新的SpringApplication&quot;">​</a></h3><p>设置web类型为WebApplicationType.NONE避免处理额外的逻辑<br> 从这里开始 <em><strong>后续的所有逻辑都发生在新的SpringApplication中旧的还卡在 listeners.environmentPrepared(environment)这一行</strong></em></p><h3 id="_2、配置新的configurableenvironment" tabindex="-1">2、配置新的ConfigurableEnvironment <a class="header-anchor" href="#_2、配置新的configurableenvironment" aria-label="Permalink to &quot;2、配置新的ConfigurableEnvironment&quot;">​</a></h3><p>同时加入一个标记 <em><strong>BOOTSTRAP_PROPERTY_SOURCE_NAME</strong></em> 后面一些逻辑的触发这个会是执行的开关</p><h3 id="_3、复制数据" tabindex="-1">3、复制数据 <a class="header-anchor" href="#_3、复制数据" aria-label="Permalink to &quot;3、复制数据&quot;">​</a></h3><p>复制旧的ConfigurableEnvironment里面的数据到ConfigurableEnvironment</p><h3 id="_4、设置source为-bootstrapimportselectorconfiguration-clase" tabindex="-1">4、设置source为 BootstrapImportSelectorConfiguration.clase <a class="header-anchor" href="#_4、设置source为-bootstrapimportselectorconfiguration-clase" aria-label="Permalink to &quot;4、设置source为 BootstrapImportSelectorConfiguration.clase&quot;">​</a></h3><p>这个执行流程去看下ConfigurationClassPostProcessor这个是spring4的时候就有了 这里会注入springcloud的核心配置类</p><h3 id="_5、执行新的上下文的初始化" tabindex="-1">5、执行新的上下文的初始化 <a class="header-anchor" href="#_5、执行新的上下文的初始化" aria-label="Permalink to &quot;5、执行新的上下文的初始化&quot;">​</a></h3><p>这里设置后会执行final ConfigurableApplicationContext context = builder.run();会执行新的上下文的初始化</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false) </span></span>
<span class="line"><span>@Import(BootstrapImportSelector.class) </span></span>
<span class="line"><span>public class BootstrapImportSelectorConfiguration {  </span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_6、加载nacos配置到新的-springapplication中" tabindex="-1">6、加载nacos配置到新的 SpringApplication中 <a class="header-anchor" href="#_6、加载nacos配置到新的-springapplication中" aria-label="Permalink to &quot;6、加载nacos配置到新的 SpringApplication中&quot;">​</a></h3><h4 id="_1、springcloud配置类加载" tabindex="-1">1、springcloud配置类加载 <a class="header-anchor" href="#_1、springcloud配置类加载" aria-label="Permalink to &quot;1、springcloud配置类加载&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>org.springframework.cloud.bootstrap.BootstrapImportSelector#selectImports { </span></span>
<span class="line"><span>    ... </span></span>
<span class="line"><span>    List&lt;String&gt; names = new ArrayList&lt;&gt;(</span></span>
<span class="line"><span>         SpringFactoriesLoader.loadFactoryNames(BootstrapConfiguration.class, classLoader)</span></span>
<span class="line"><span>         );</span></span>
<span class="line"><span>     .... </span></span>
<span class="line"><span>     }</span></span></code></pre></div><p>这里会去读 <em><strong>spring.factories</strong></em> 里面等号前是 <em><strong>org.springframework.cloud.bootstrap.BootstrapConfiguration</strong></em>的值了</p><blockquote><p>（这里读的其实是缓存了,在开始的setInitializers((Collection)getSpringFactoriesInstances(ApplicationContextInitializer.class))地方就已经全部加载好了）</p></blockquote><p>这里会读两段配置 一段配置来自SpringCloud 一段配置来自nacos（当然还有其他框架配置 这里不做讨论）</p><h4 id="_2、springcloud核心配置类" tabindex="-1">2、springcloud核心配置类 <a class="header-anchor" href="#_2、springcloud核心配置类" aria-label="Permalink to &quot;2、springcloud核心配置类&quot;">​</a></h4><p>这是springcloud的配置 真正干活的类是</p><p><img src="https://i.imgur.com/bYohCRs.png" alt="springcloud核心配置类"></p><h4 id="_3、nacos核心配置类" tabindex="-1">3、nacos核心配置类 <a class="header-anchor" href="#_3、nacos核心配置类" aria-label="Permalink to &quot;3、nacos核心配置类&quot;">​</a></h4><p><img src="https://i.imgur.com/usiS9DJ.png" alt="nacos核心配置类"></p><h4 id="_4、加载nacos配置" tabindex="-1">4、加载nacos配置 <a class="header-anchor" href="#_4、加载nacos配置" aria-label="Permalink to &quot;4、加载nacos配置&quot;">​</a></h4><p>PropertySourceBootstrapConfiguration是实现了ApplicationContextInitializer这个方法的所以在新springbootApplication的run方法里面会被触发initialize方法</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class PropertySourceBootstrapConfiguration implements ApplicationListener&lt;ContextRefreshedEvent&gt;,</span></span>
<span class="line"><span>       ApplicationContextInitializer&lt;ConfigurableApplicationContext&gt;, Ordered {</span></span>
<span class="line"><span>         @Override</span></span>
<span class="line"><span></span></span>
<span class="line"><span>这个就是nacos加入springcloud这个大家庭的地方 会被框架自动注入进来</span></span>
<span class="line"><span>@Autowired(required = false)</span></span>
<span class="line"><span>private List&lt;PropertySourceLocator&gt; propertySourceLocators = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public void initialize(ConfigurableApplicationContext applicationContext) {</span></span>
<span class="line"><span>    if (!bootstrapProperties.isInitializeOnContextRefresh() </span></span>
<span class="line"><span>    || !applicationContext.getEnvironment()</span></span>
<span class="line"><span>        .getPropertySources()</span></span>
<span class="line"><span>        .contains(BootstrapApplicationListener.BOOTSTRAP_PROPERTY_SOURCE_NAME)) </span></span>
<span class="line"><span>        // BOOTSTRAP_PROPERTY_SOURCE_NAME 开关控制是是否拉取数据</span></span>
<span class="line"><span>     {</span></span>
<span class="line"><span>       doInitialize(applicationContext);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>private void doInitialize(ConfigurableApplicationContext applicationContext) {</span></span>
<span class="line"><span>    List&lt;PropertySource&lt;?&gt;&gt; composite = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>    AnnotationAwareOrderComparator.sort(this.propertySourceLocators);</span></span>
<span class="line"><span>    boolean empty = true;</span></span>
<span class="line"><span>    ConfigurableEnvironment environment = applicationContext.getEnvironment();</span></span>
<span class="line"><span>    for (PropertySourceLocator locator : this.propertySourceLocators) {</span></span>
<span class="line"><span>       Collection&lt;PropertySource&lt;?&gt;&gt; source = locator.locateCollection(environment);</span></span>
<span class="line"><span>       if (source == null || source.size() == 0) {</span></span>
<span class="line"><span>          continue;</span></span>
<span class="line"><span>       }</span></span>
<span class="line"><span>       List&lt;PropertySource&lt;?&gt;&gt; sourceList = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>       for (PropertySource&lt;?&gt; p : source) {</span></span>
<span class="line"><span>          if (p instanceof EnumerablePropertySource&lt;?&gt; enumerable) {</span></span>
<span class="line"><span>             sourceList.add(new BootstrapPropertySource&lt;&gt;(enumerable));</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>          else {</span></span>
<span class="line"><span>             sourceList.add(new SimpleBootstrapPropertySource(p));</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>       }</span></span>
<span class="line"><span>       logger.info(&quot;Located property source: &quot; + sourceList);</span></span>
<span class="line"><span>       composite.addAll(sourceList);</span></span>
<span class="line"><span>       empty = false;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (!empty) {</span></span>
<span class="line"><span>       MutablePropertySources propertySources = environment.getPropertySources();</span></span>
<span class="line"><span>       String logConfig = environment.resolvePlaceholders(&quot;\${logging.config:}&quot;);</span></span>
<span class="line"><span>       LogFile logFile = LogFile.get(environment);</span></span>
<span class="line"><span>       for (PropertySource&lt;?&gt; p : environment.getPropertySources()) {</span></span>
<span class="line"><span>          if (p.getName().startsWith(BOOTSTRAP_PROPERTY_SOURCE_NAME)) {</span></span>
<span class="line"><span>             propertySources.remove(p.getName());</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>       }</span></span>
<span class="line"><span>       insertPropertySources(propertySources, composite);</span></span>
<span class="line"><span>       reinitializeLoggingSystem(environment);</span></span>
<span class="line"><span>       setLogLevels(applicationContext, environment);</span></span>
<span class="line"><span>       handleProfiles(environment);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}  }</span></span></code></pre></div><h5 id="_1、nacos核心类被注入" tabindex="-1">1、nacos核心类被注入 <a class="header-anchor" href="#_1、nacos核心类被注入" aria-label="Permalink to &quot;1、nacos核心类被注入&quot;">​</a></h5><p>PropertySourceBootstrapConfiguration的属性propertySourceLocators会把nacos里面的NacosPropertySourceLocator自动加载进来</p><h5 id="_2、框架触发调用" tabindex="-1">2、框架触发调用 <a class="header-anchor" href="#_2、框架触发调用" aria-label="Permalink to &quot;2、框架触发调用&quot;">​</a></h5><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Collection&gt; source = locator.locateCollection(environment); 在这行里面 将nacos的配置读取到新的environment里面</span></span></code></pre></div><h1 id="_6、总结" tabindex="-1">6、总结 <a class="header-anchor" href="#_6、总结" aria-label="Permalink to &quot;6、总结&quot;">​</a></h1><ul><li><p>springcloud是基于springboot进行构建的 所以要参与到springboot的流程中，需要通过springboot的留给外部的扩展点 这里选择了spring.factories配置文件且是通过org.springframework.context.ApplicationListener这个配置属性接入的</p></li><li><p>nacos作为服务想要进入springcloud的体系需要依赖springcloud的扩展点 这里nacos依然使用了spring.factories配置文件 同时实现的springcloud要求的接口PropertySourceLocator 然后将自己的东西给到了springcloud</p></li><li><p>本身nacos可直接对接springboot 对接用的是beanFactotyProcessor的规范 但是没啥必要</p></li><li><p>springcloud或者springboot 对接其他框架都是基于 这些扩展点</p></li></ul>`,59)])])}const h=a(i,[["render",o]]);export{d as __pageData,h as default};
