package org.xidea.jsi.impl.test;

import static org.junit.Assert.assertEquals;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;

import org.junit.Before;
import org.junit.Test;
import org.xidea.jsi.JSILoadContext;
import org.xidea.jsi.JSIRoot;
import org.xidea.jsi.ScriptLoader;
import org.xidea.jsi.impl.v2.DataRoot;
import org.xidea.jsi.impl.v2.DefaultLoadContext;

public class DataJSIRootTest {

	private DataRoot root;
	private String packageName = this.getClass().getPackage().getName();
	private static File destDir;
	static{
		File file = new File(DataJSIRootTest.class.getResource("/").getFile());
		file = file.getParentFile()// WEB-INF
				.getParentFile()// web
				.getParentFile();// root
		destDir = new File(destDir, "build/dest");
	}

	@SuppressWarnings("unchecked")
	@Before
	public void setUp() throws Exception {
		HashMap data = new HashMap();
		data.put(packageName.replace('.', '/') + "/utf8.js", "测试utf8");
		root = new DataRoot(data);
	}

	@Test
	public void testLoadText() {
		assertEquals("测试utf8", root.loadText(packageName, "utf8.js"));
	}

	@Test
	public void testDataRoot() throws UnsupportedEncodingException, IOException {
		String source = loadDestText("exported-all.xml");
		DataRoot root = new DataRoot(source);
		JSILoadContext loadContext = new DefaultLoadContext();
		root.$export("example", loadContext);
		//root.$import("example.alias.*", loadContext);
//		root.$import("example.dependence.*", loadContext);
//		root.$import("example.internal.*", loadContext);
//		root.$import("org.xidea.jsidoc.*", loadContext);
//		root.$import("org.xidea.jsidoc.export.*", loadContext);
//		root.$import("org.xidea.jsidoc.util.*", loadContext);
		StringBuilder buf = new StringBuilder();
		for (ScriptLoader file : loadContext.getScriptList()) {
			if (buf.length() > 0) {
				buf.append(',');
			}
			buf.append(file.getPath());
		}
		System.out.println(buf);
	}

	private String loadDestText(String file)
			throws UnsupportedEncodingException, IOException {
		java.io.InputStreamReader in = new java.io.InputStreamReader(
				new FileInputStream(new File(destDir, file)), "utf-8");
		char[] buf = new char[1024];
		int count;
		StringWriter out = new StringWriter();
		while ((count = in.read(buf)) >= 0) {
			out.write(buf, 0, count);
		}
		return out.toString();

	}
}
