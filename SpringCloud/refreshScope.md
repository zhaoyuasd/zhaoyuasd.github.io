# RefreshScope工作原理
## 关于Scope
```
	org.springframework.beans.factory.support.AbstractBeanFactory#doGetBean
    
    if (mbd.isSingleton()) {
					sharedInstance = getSingleton(beanName, () -> {
						try {
							return createBean(beanName, mbd, args);
						}
						catch (BeansException ex) {
							// Explicitly remove instance from singleton cache: It might have been put there
							// eagerly by the creation process, to allow for circular reference resolution.
							// Also remove any beans that received a temporary reference to the bean.
							destroySingleton(beanName);
							throw ex;
						}
					});
					beanInstance = getObjectForBeanInstance(sharedInstance, requiredType, name, beanName, mbd);
				}

				else if (mbd.isPrototype()) {
					// It's a prototype -> create a new instance.
					Object prototypeInstance = null;
					try {
						beforePrototypeCreation(beanName);
						prototypeInstance = createBean(beanName, mbd, args);
					}
					finally {
						afterPrototypeCreation(beanName);
					}
					beanInstance = getObjectForBeanInstance(prototypeInstance, requiredType, name, beanName, mbd);
				}

				else {
					String scopeName = mbd.getScope();
					if (!StringUtils.hasLength(scopeName)) {
						throw new IllegalStateException("No scope name defined for bean '" + beanName + "'");
					}
					Scope scope = this.scopes.get(scopeName);
					if (scope == null) {
						throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
					}
					try {
						Object scopedInstance = scope.get(beanName, () -> {
							beforePrototypeCreation(beanName);
							try {
								return createBean(beanName, mbd, args);
							}
							finally {
								afterPrototypeCreation(beanName);
							}
						});
						beanInstance = getObjectForBeanInstance(scopedInstance, requiredType, name, beanName, mbd);
					}
					catch (IllegalStateException ex) {
						throw new ScopeNotActiveException(beanName, scopeName, ex);
					}
				}
			}
```
> spring在管理Bean的时候，不同的Bean有不同的生效范围，我们知道默认的Bean都是单例的(Singleton),还有可以声明为原型的（Prototype），spring对其管理各部相同。 在后续的逻辑中，又不补充了从Scope中获取Bean。  
> Scope是一个接口，是框架留给我们，允许我们对Bean进行自定义管理的一个实现入口。

## RefreshScope注解

```
/**
 * Convenience annotation to put a <code>@Bean</code> definition in
 * {@link org.springframework.cloud.context.scope.refresh.RefreshScope refresh scope}.
 * Beans annotated this way can be refreshed at runtime and any components that are using
 * them will get a new instance on the next method call, fully initialized and injected
 * with all dependencies.
 *
 * @author Dave Syer
 *
 */
@Target({ ElementType.TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Scope("refresh")
@Documented
public @interface RefreshScope {

	/**
	 * Alias for {@link Scope#proxyMode}.
	 * @see Scope#proxyMode()
	 * @return proxy mode
	 */
	@AliasFor(annotation = Scope.class)
	ScopedProxyMode proxyMode() default ScopedProxyMode.TARGET_CLASS;

}
```

>这个注解是在springCloud中引入的， 实现的功能是动态刷新相关配置，一般结合配置中心（nacos）使用，可以在不重启服务的条件下，更改类中一些属性（数据库连接池慎用）
```

@RestController
@RequestMapping("/config")
public class ConfigController {
   @Autowired
   private ConfigService configService;
    /**
     * http://localhost:8080/config/get
     */
    @RequestMapping("/get")
    public String get() {
        return configService.get();
    }
}

@Service
@RefreshScope
public class ConfigService {
    @Value("${useLocalCache:not_load}")
    private String useLocalCache;

    public String get() {
        return useLocalCache  +"  "+ this.hashCode();
    }
}
```
> 这个代码会随着配置中心 useLocalCache的变化而变化 同时后面的hashCode也会变化（实际是生成了一个新的实例） 

> 我们知道在调用controller的接口的时候 这个configService一定是已经注入完成的了，可是当我们修改完对应的属性后你会发现确实变了，我们知道确实重新生成了一个但是这重新生成的实例是怎么给到controller的呢？   
> 聪明的你一定想到了一个方向 “代理”、“aop”，然后你会发现并没有对应的BeanProccessor来完成处理这个代理.   
> 事实上确实是代理，干活的也是确实是aop， 但是在发生代理的地方不在getBean里面（其实后续还是会getBean，看到后面你就你明白了），而是在Bean的注册上。

## Bean注册解析Scope信息
```
org.springframework.context.annotation.ClassPathBeanDefinitionScanner#doScan

Set<BeanDefinitionHolder> beanDefinitions = new LinkedHashSet<>();
		for (String basePackage : basePackages) {
			Set<BeanDefinition> candidates = findCandidateComponents(basePackage);
			for (BeanDefinition candidate : candidates) {

				ScopeMetadata scopeMetadata = this.scopeMetadataResolver.resolveScopeMetadata(candidate);
                
                candidate.setScope(scopeMetadata.getScopeName());
				String beanName = this.beanNameGenerator.generateBeanName(candidate, this.registry);
				if (candidate instanceof AbstractBeanDefinition abstractBeanDefinition) {
					postProcessBeanDefinition(abstractBeanDefinition, beanName);
				}
				if (candidate instanceof AnnotatedBeanDefinition annotatedBeanDefinition) {
					AnnotationConfigUtils.processCommonDefinitionAnnotations(annotatedBeanDefinition);
				}
				if (checkCandidate(beanName, candidate)) {
					BeanDefinitionHolder definitionHolder = new BeanDefinitionHolder(candidate, beanName);
					definitionHolder =
							AnnotationConfigUtils.applyScopedProxyMode(scopeMetadata, definitionHolder, this.registry);
					beanDefinitions.add(definitionHolder);
					registerBeanDefinition(definitionHolder, this.registry);
				}
			}
		}
```
>	*ScopeMetadata scopeMetadata = this.scopeMetadataResolver.resolveScopeMetadata(candidate)* 这个会解析scope信息
```

org.springframework.context.annotation.AnnotationScopeMetadataResolver#resolveScopeMetadata

	@Override
	public ScopeMetadata resolveScopeMetadata(BeanDefinition definition) {
		ScopeMetadata metadata = new ScopeMetadata();
		if (definition instanceof AnnotatedBeanDefinition annDef) {
			AnnotationAttributes attributes = AnnotationConfigUtils.attributesFor(
					annDef.getMetadata(), this.scopeAnnotationType);
			if (attributes != null) {
				metadata.setScopeName(attributes.getString("value"));
				ScopedProxyMode proxyMode = attributes.getEnum("proxyMode");
				if (proxyMode == ScopedProxyMode.DEFAULT) {
					proxyMode = this.defaultProxyMode;
				}
				metadata.setScopedProxyMode(proxyMode);
			}
		}
		return metadata;
	}
```
> 解析完以后 definitionHolder =AnnotationConfigUtils.applyScopedProxyMode(scopeMetadata, definitionHolder, this.registry) 这个方法会完成代理的创建

```
org.springframework.context.annotation.AnnotationConfigUtils#applyScopedProxyMode
static BeanDefinitionHolder applyScopedProxyMode(
			ScopeMetadata metadata, BeanDefinitionHolder definition, BeanDefinitionRegistry registry) {

		ScopedProxyMode scopedProxyMode = metadata.getScopedProxyMode();
		if (scopedProxyMode.equals(ScopedProxyMode.NO)) {
			return definition;
		}
		boolean proxyTargetClass = scopedProxyMode.equals(ScopedProxyMode.TARGET_CLASS);
		return ScopedProxyCreator.createScopedProxy(definition, registry, proxyTargetClass);
	}
```
> 然后就是 *ScopedProxyCreator.createScopedProxy(definition, registry, proxyTargetClass)*，注意这里返回的不是代理对象而是*BeanDefinitionHolder*，还是注册信息，而且后面的BeanProccessor也是不会对他进行aop的。

```
public static BeanDefinitionHolder createScopedProxy(BeanDefinitionHolder definition,
			BeanDefinitionRegistry registry, boolean proxyTargetClass) {

		String originalBeanName = definition.getBeanName();
		BeanDefinition targetDefinition = definition.getBeanDefinition();

        // 重新生成一个名字不和原来的冲突  TARGET_NAME_PREFIX + originalBeanName;
		String targetBeanName = getTargetBeanName(originalBeanName);

		// Create a scoped proxy definition for the original bean name,
		// "hiding" the target bean in an internal target definition.
        // 这里更改工厂 
		RootBeanDefinition proxyDefinition = new RootBeanDefinition(ScopedProxyFactoryBean.class);


		proxyDefinition.setDecoratedDefinition(new BeanDefinitionHolder(targetDefinition, targetBeanName));
		proxyDefinition.setOriginatingBeanDefinition(targetDefinition);
		proxyDefinition.setSource(definition.getSource());
		proxyDefinition.setRole(targetDefinition.getRole());

        // ScopedProxyFactoryBean 里面有这个属性在getbean的时候 会被注入进去
		proxyDefinition.getPropertyValues().add("targetBeanName", targetBeanName);
		if (proxyTargetClass) {
			targetDefinition.setAttribute(AutoProxyUtils.PRESERVE_TARGET_CLASS_ATTRIBUTE, Boolean.TRUE);
			// ScopedProxyFactoryBean's "proxyTargetClass" default is TRUE, so we don't need to set it explicitly here.
		}
		else {
			proxyDefinition.getPropertyValues().add("proxyTargetClass", Boolean.FALSE);
		}

		// Copy autowire settings from original bean definition.
		proxyDefinition.setAutowireCandidate(targetDefinition.isAutowireCandidate());
		proxyDefinition.setPrimary(targetDefinition.isPrimary());
		proxyDefinition.setFallback(targetDefinition.isFallback());
		if (targetDefinition instanceof AbstractBeanDefinition abd) {
			proxyDefinition.setDefaultCandidate(abd.isDefaultCandidate());
			proxyDefinition.copyQualifiersFrom(abd);
		}

		// The target bean should be ignored in favor of the scoped proxy.
		targetDefinition.setAutowireCandidate(false);
		targetDefinition.setPrimary(false);
		targetDefinition.setFallback(false);
		if (targetDefinition instanceof AbstractBeanDefinition abd) {
			abd.setDefaultCandidate(false);
		}

		// Register the target bean as separate bean in the factory.
        // 
		registry.registerBeanDefinition(targetBeanName, targetDefinition);

		// Return the scoped proxy definition as primary bean definition
		// (potentially an inner bean).
		return new BeanDefinitionHolder(proxyDefinition, originalBeanName, definition.getAliases());
	}
```

上面的代码做了下面几件事：
* 生成了一个 ScopedProxyFactoryBean的RootBeanDefinition 将原来的Bean的信息填充了进去
* 生成可一个新的beanName(TARGET_NAME_PREFIX + originalBeanName),同时用新的名字和原来的Bean的定义在registry中进行Bean的登记 **registry.registerBeanDefinition(targetBeanName, targetDefinition)**
* 用最初的beanName和代理的Bean定义组成一个新的BeanDefinitionHolder返回，从后面的代码我们可以知道registry会登记有 **旧的BeanName到代理的BeanDefinition** 的关系。

> 根据上面的代码，结合给出的代码示例，ConfigController在执行获取ConfigService的注入的时候，最初进行填充的处理的其实是ScopedProxyFactoryBean不是ConfigService
```
public class ScopedProxyFactoryBean extends ProxyConfig
		implements FactoryBean<Object>, BeanFactoryAware, AopInfrastructureBean {

	/** The TargetSource that manages scoping. */
	private final SimpleBeanTargetSource scopedTargetSource = new SimpleBeanTargetSource();

	/** The name of the target bean. */
	private @Nullable String targetBeanName;

	/** The cached singleton proxy. */
	private @Nullable Object proxy;

	@Override
	public void setBeanFactory(BeanFactory beanFactory) {
		if (!(beanFactory instanceof ConfigurableBeanFactory cbf)) {
			throw new IllegalStateException("Not running in a ConfigurableBeanFactory: " + beanFactory);
		}
		this.scopedTargetSource.setBeanFactory(beanFactory);

		ProxyFactory pf = new ProxyFactory();
		pf.copyFrom(this);
		pf.setTargetSource(this.scopedTargetSource);  // 这个source后续会被拿来进行类的实例化

		Assert.notNull(this.targetBeanName, "Property 'targetBeanName' is required");
		Class<?> beanType = beanFactory.getType(this.targetBeanName);
		if (beanType == null) {
			throw new IllegalStateException("Cannot create scoped proxy for bean '" + this.targetBeanName +
					"': Target type could not be determined at the time of proxy creation.");
		}
		if (!isProxyTargetClass() || beanType.isInterface() || Modifier.isPrivate(beanType.getModifiers())) {
			pf.setInterfaces(ClassUtils.getAllInterfacesForClass(beanType, cbf.getBeanClassLoader()));
		}

		// Add an introduction that implements only the methods on ScopedObject.
		ScopedObject scopedObject = new DefaultScopedObject(cbf, this.scopedTargetSource.getTargetBeanName());
		pf.addAdvice(new DelegatingIntroductionInterceptor(scopedObject));

		// Add the AopInfrastructureBean marker to indicate that the scoped proxy
		// itself is not subject to auto-proxying! Only its target bean is.
		pf.addInterface(AopInfrastructureBean.class);

		this.proxy = pf.getProxy(cbf.getBeanClassLoader());
	}

    /**
	 * Set the name of the bean that is to be scoped.
	 */
	public void setTargetBeanName(String targetBeanName) {
		this.targetBeanName = targetBeanName;
		this.scopedTargetSource.setTargetBeanName(targetBeanName); // 这里干了点额外的活
	}


	@Override
	public @Nullable Object getObject() {
		if (this.proxy == null) {
			throw new FactoryBeanNotInitializedException();
		}
		return this.proxy;
	}
```

> ScopedProxyFactoryBean实现了BeanFactoryAware，在Bean创建的最后阶段会调用一些aware接口，这时会调用setBeanFactory方法在ScopedProxyFactoryBean 创建代理类 注意它一个属性是targetBeanName，之前构建的时候 有这么一句 *proxyDefinition.getPropertyValues().add("targetBeanName", targetBeanName)*，这里会用TARGET_NAME_PREFIX + originalBeanName这个去找到原始的Bean定义去创建Bean的代理。


> 最后真正调用的地方
```
org.springframework.aop.framework.JdkDynamicAopProxy#invoke

{
		Object oldProxy = null;
		boolean setProxyContext = false;

		TargetSource targetSource = this.advised.targetSource;
		Object target = null;

		....
			target = targetSource.getTarget();
			Class<?> targetClass = (target != null ? target.getClass() : null);

		...
			return retVal;
		}
		finally {
			if (target != null && !targetSource.isStatic()) {
				// Must have come from TargetSource.
				targetSource.releaseTarget(target);
			}
			if (setProxyContext) {
				// Restore old proxy.
				AopContext.setCurrentProxy(oldProxy);
			}
		}
	}


public class SimpleBeanTargetSource extends AbstractBeanFactoryBasedTargetSource {

	@Override
	public Object getTarget() throws Exception {
		return getBeanFactory().getBean(getTargetBeanName());
	}

}
```
  * 这个TargetSource 其实是在 ScopedProxyFactoryBean里面的 SimpleBeanTargetSource
  * 在ScopedProxyFactoryBean进行初始化完成属性设置的时候targetBeanName也被给到了SimpleBeanTargetSource，
  * 所以是拿着这个名字找原始的Bean定义然后再进行实例化的
  

 ## RefreshScope是如何管理的
### 创建
```
@Override
	public Object get(String name, ObjectFactory<?> objectFactory) {
		BeanLifecycleWrapper value = this.cache.put(name, new BeanLifecycleWrapper(name, objectFactory));
		this.locks.putIfAbsent(name, new ReentrantReadWriteLock());
		try {
			return value.getBean();
		}
		catch (RuntimeException e) {
			this.errors.put(name, e);
			throw e;
		}
	}
```
### 监听到变更后
```
@Override
	public void destroy() {
		List<Throwable> errors = new ArrayList<>();
		Collection<BeanLifecycleWrapper> wrappers = this.cache.clear();
		for (BeanLifecycleWrapper wrapper : wrappers) {
			try {
				Lock lock = this.locks.get(wrapper.getName()).writeLock();
				lock.lock();
				try {
					wrapper.destroy();
				}
				finally {
					lock.unlock();
				}
			}
			catch (RuntimeException e) {
				errors.add(e);
			}
		}
		if (!errors.isEmpty()) {
			throw wrapIfNecessary(errors.get(0));
		}
		this.errors.clear();
	}

```
> 直接全部清除

## 总结
* 在类定义注册的时候，spring会注册两个Bean定义，一个是 **最初的beanName关联ScopedProxyFactoryBean的Bean定义**, 一个是**生成的BeanName关联的原始的Bean的定义**, 注意***这个ScopedProxyFactoryBean的Bean定义是单例不会走到Scope里面***
* 在第一次获取的后首先填充的其实是 **ScopedProxyFactoryBean** ,直到最后BeanFactoryAware接口被调用的时候，才会创建一个代理,被注入的其实是一个代理（configService其实是一个代理），  这个时候真正的Bean其实还是没有创建的。
* 在后续调用中会用**生成的BeanName关联的原始的Bean的定义**来进行Bean的创建，同时交给RefreshScope进行管理，必要时进行销毁。