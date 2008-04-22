package org.xidea.jsi.impl;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.xidea.jsi.JSIDependence;
import org.xidea.jsi.JSILoadContext;
import org.xidea.jsi.JSIPackage;
import org.xidea.jsi.JSIRoot;

/**
 * 初定该实现的依赖只能时一个文件，可能时该文件的全部脚本，也可能时某个确定脚本
 * 
 * @author jindw
 * 
 */
public class DefaultJSIDependence implements JSIDependence {
	protected Map<String, List<String>> targetMap = new HashMap<String, List<String>>();
	protected final JSIPackage targetPackage;
	protected String targetFileName;
	protected String targetObjectName;
	protected String thisObjectName;
	protected JSIRoot root;
	protected boolean afterLoad;

	/**
	 * @param root
	 *            JSI上下文
	 * @param sourcePackage
	 *            依赖源包
	 * @param sourceObject
	 *            依赖源元素
	 * @param targetObjectName
	 *            目标元素
	 * @param requiredBefore
	 *            装在前依赖
	 */
	public DefaultJSIDependence(JSIRoot root, JSIPackage targetPackage,
			String targetFileName, String targetObjectName, boolean afterLoad) {
		this.root = root;
		this.afterLoad = afterLoad;
		this.targetPackage = targetPackage;
		this.targetFileName = targetFileName;
		this.targetObjectName = targetObjectName;
	}

	public DefaultJSIDependence instanceFor(String thisObjectName) {
		DefaultJSIDependence instance = new DefaultJSIDependence(this.root,
				this.targetPackage, this.targetFileName, this.targetObjectName,
				this.afterLoad);
		instance.thisObjectName = thisObjectName;
		return instance;
	}



	/* (non-Javadoc)
	 * @see org.xidea.jsi.impl.JSIDependence#isAfterLoad()
	 */
	public boolean isAfterLoad() {
		return afterLoad;
	}

	/* (non-Javadoc)
	 * @see org.xidea.jsi.impl.JSIDependence#getTargetFileName()
	 */
	public String getTargetFileName() {
		return targetFileName;
	}

	/* (non-Javadoc)
	 * @see org.xidea.jsi.impl.JSIDependence#getTargetObjectName()
	 */
	public String getTargetObjectName() {
		return targetObjectName;
	}

	public String getThisObjectName() {
		return thisObjectName;
	}

	public void initialize(List<String> buf) {
		if (targetObjectName instanceof String) {
			buf.add((String) targetObjectName);
		} else {
			for (Iterator<String> it = (targetPackage.getScriptObjectMap()
					.get(targetFileName)).iterator(); it.hasNext();) {
				buf.add(it.next());
			}

		}
	}

	public void load(JSILoadContext loadContext) {
		if (targetObjectName instanceof String) {
			loadContext.loadScript(this.targetPackage, targetFileName,
					(String) targetObjectName, false);
		} else {
			loadContext.loadScript(this.targetPackage, targetFileName, null,
					false);
		}
	}

	public JSIPackage getTargetPackage() {
		return targetPackage;
	}
}
