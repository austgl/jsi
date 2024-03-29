package org.xidea.jsi.impl.v2;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.xidea.jsi.JSIRoot;

public class ClasspathRoot extends AbstractRoot implements JSIRoot {
	private static final Log log = LogFactory.getLog(ClasspathRoot.class);
	private String encoding = "utf-8";
	protected ClassLoader loader;

	public ClasspathRoot() {
		this(null);
	}
	public ClasspathRoot(String encoding) {
		this(null,encoding);
	}
	public ClasspathRoot(ClassLoader loader,String encoding) {
		this.loader = loader == null?this.getClass().getClassLoader():loader;
		if(encoding!=null){
			this.encoding = encoding;
		}
	}

	public String loadText(String pkgName, String scriptName) {
		try {
			String path ;
			if(pkgName!=null&&pkgName.length()>0){
				path = pkgName.replace('.', '/')+'/'+scriptName;
			}else{
				path = scriptName;
			}
			return loadText(path,loader,encoding);
		} catch (IOException e) {
			log.warn(e);;
			return null;
		}
	}
	public static String loadText(String path,ClassLoader loader,String encoding) throws UnsupportedEncodingException,
			IOException {
		InputStream in = loader.getResourceAsStream(path); 
		return JSIText.loadText(in, encoding);
	}

}
