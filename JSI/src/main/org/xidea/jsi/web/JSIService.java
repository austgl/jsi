package org.xidea.jsi.web;

import java.io.IOException;
import java.io.OutputStream;
import java.io.StringWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.xidea.jsi.JSIExportor;
import org.xidea.jsi.JSILoadContext;
import org.xidea.jsi.ScriptNotFoundException;
import org.xidea.jsi.impl.DataRoot;
import org.xidea.jsi.impl.DefaultExportorFactory;
import org.xidea.jsi.impl.DefaultLoadContext;
import org.xidea.jsi.impl.FileRoot;
import org.xidea.jsi.impl.ResourceRoot;
import org.xidea.jsi.impl.JSIText;

public class JSIService extends ResourceRoot{
	@SuppressWarnings("unused")
	private static final Log log = LogFactory.getLog(JSIService.class);
	protected Map<String, String> cachedMap;// = new WeakHashMap<String,
	protected SDNService sdn = new SDNService(this);
	
	public void service(String path, Map<String, String[]> param, Writer out)
			throws IOException {
		if (path == null || path.length() == 0) {
			out.write(document());
			// "text/html";
		} else if ("export.action".equals(path)) {
			out.write(export(param));
		} else if (path.startsWith("=")) {
			path = path.substring(1);
			if (path.length() == 0) {
				throw new ScriptNotFoundException("");
			}
			writeSDNRelease(path, out);
			// "text/plain";
		} else {
			boolean isPreload = false;
			if (path.endsWith(JSIText.PRELOAD_FILE_POSTFIX)) {
				isPreload = true;
				path = path.substring(0, path.length()
						- JSIText.PRELOAD_FILE_POSTFIX.length())
						+ ".js";
			}
			this.writeResource(path, isPreload, out);
		}
		out.flush();
	}

	public void writeSDNRelease(String path, Writer out) throws IOException {
		String result = null;
		if (cachedMap != null) {
			result = cachedMap.get(path);
		}
		if (result == null) {
			result = sdn.doReleaseExport(path);
			if(cachedMap!= null){
				cachedMap.put(path, result);
			}
		}
		out.append(result);
	}

	public void writeSDNDebug(String path, Writer out) throws IOException {
		out.write(sdn.doDebugExport(path));
	}

	protected boolean writeResource(String path, boolean isPreload, Writer out)
			throws IOException {
		if (isPreload) {
			return this.output(path, out,JSIText.buildPreloadPerfix(path),JSIText.buildPreloadPostfix("//"));
		} else {
			return this.output(path, out,null,null);
		}
	}

	protected boolean writeResource(String path, boolean isPreload,
			OutputStream out) throws IOException {
		if (isPreload) {
			byte[] prefix = JSIText.buildPreloadPerfix(path).getBytes();
			byte[] postfix = JSIText.buildPreloadPostfix("//").getBytes();
			return this.output(path, out,prefix,postfix);
		} else {
			return this.output(path, out,null,null);
		}
	}


	protected String document() {
		List<String> packageList = FileRoot
				.findPackageList(this.getScriptBaseDirectory());
		StringWriter out = new StringWriter();
		if (packageList.isEmpty()) {
			//

			out.append("<html><head>");
			out.append("<meta http-equiv='Content-Type' content='text/html;utf-8'/>");
			out.append("</head>");
			out.append("<body> 未发现任何托管脚本包，无法显示JSIDoc。<br /> ");
			out.append("请添加脚本包，并在包目录下正确添加相应的包定义文件 。");
			out
					.append("<a href='org/xidea/jsidoc/index.html?group={\"example\":[\"example\",\"example.internal\",\"example.dependence\",\"org.xidea.jsidoc.util\"]}'>");
			out.append("察看示例</a>");
			out.append("</body><html>");
		} else {

			out.append("<html><frameset rows='100%'>");
			out.append("<frame src='org/xidea/jsidoc/index.html?");
			out.append("group={\"All\":");
			out.append("[\"");
			boolean isFirst = true;
			for (String packageName : packageList) {
				if (isFirst) {
					isFirst = false;
				} else {
					out.append("\",\"");
				}
				out.append(packageName);

			}
			out.append("\"]}'> </frameset></html>");
		}
		return out.toString();
	}

	protected String export(Map<String, String[]> param) throws IOException {
		String[] contents = param.get("content");
		if (contents != null) {
			final DataRoot root = new DataRoot(contents[0]);
			JSIExportor exportor = DefaultExportorFactory.getInstance()
					.createExplorter(param);
			if (exportor == null) {
				return null;
			}
			JSILoadContext context = new DefaultLoadContext();
			String[] exports = param.get("exports");
			if (exports != null) {
				// 只有Data Root 才能支持这种方式
				for (String item : exports) {
					// PHP 不支持同名参数
					for (String subitem : item.split("[^\\w\\$\\:\\.\\-\\*]+")) {
						root.$import(subitem, context);
					}
				}
			}
			return exportor.export(context);
		} else {
			Map<String, String[]> testParams = new HashMap<String, String[]>();
			testParams.put("level", new String[] { String
					.valueOf(DefaultExportorFactory.TYPE_EXPORT_CONFUSE) });
			return DefaultExportorFactory.getInstance().createExplorter(
					testParams) == null ? null : "";
		}

	}

	protected boolean isIndex(String path) {
		return path.length() == 0 || path.equals("index.jsp")
				|| path.equals("index.php");
	}


}