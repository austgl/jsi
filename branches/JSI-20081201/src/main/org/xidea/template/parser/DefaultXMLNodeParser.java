package org.xidea.template.parser;

import java.util.List;
import java.util.regex.Pattern;

import org.w3c.dom.Attr;
import org.w3c.dom.CDATASection;
import org.w3c.dom.DocumentType;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.ProcessingInstruction;
import org.w3c.dom.Text;
import org.xidea.template.Template;

public class DefaultXMLNodeParser implements NodeParser {

	public static final Pattern SCRIPT_TAG = Pattern.compile("^script$",
			Pattern.CASE_INSENSITIVE);

	private XMLParser parser;

	public DefaultXMLNodeParser(XMLParser parser) {
		this.parser = parser;
	}

	public boolean parseNode(Node node, ParseContext context) {
		switch (node.getNodeType()) {
		case 1: // NODE_ELEMENT
			return parseElement(node, context);
		case 2: // NODE_ATTRIBUTE
			return parseAttribute(node, context);
		case 3: // NODE_TEXT
			return parseTextNode(node, context);
		case 4: // NODE_CDATA_SECTION
			return parseCDATA(node, context);
		case 5: // NODE_ENTITY_REFERENCE
			return parseEntityReference(node, context);
		case 6: // NODE_ENTITY
			return parseEntity(node, context);
		case 7: // NODE_PROCESSING_INSTRUCTION
			return parseProcessingInstruction(node, context);
		case 8: // NODE_COMMENT
			return parseComment(node, context);
		case 9: // NODE_DOCUMENT
		case 11:// NODE_DOCUMENT_FRAGMENT
			return parseDocument(node, context);
		case 10:// NODE_DOCUMENT_TYPE
			return parseDocumentType(node, context);
			// case 11://NODE_DOCUMENT_FRAGMENT
			// return parseDocumentFragment(node,context);
		case 12:// NODE_NOTATION
			return parseNotation(node, context);
		default:// 文本节点
			// this.println("<!-- ERROR： UNKNOW nodeType:"+node.nodeType+"-->")
			return false;
		}
	}

	private boolean parseProcessingInstruction(Node node, ParseContext context) {
		context.append("<?" + node.getNodeName() + " "
				+ ((ProcessingInstruction) node).getData() + "?>");
		context.appendFormatEnd();
		return true;
	}

	private boolean parseCDATA(Node node, ParseContext context) {
		boolean format = (node.getPreviousSibling() != null || node
				.getNextSibling() != null);
		if (format) {
			context.appendFormatIndent();
		}
		context.append("<![CDATA[");
		context.appendList(this.parser.parseText(((CDATASection) node)
				.getData(), false, false, 0));
		context.append("]]>");
		if (format) {
			context.appendFormatEnd();
		}
		return true;
	}

	private boolean parseNotation(Node node, ParseContext context) {
		throw new UnsupportedOperationException("parseNotation not support");
	}

	private boolean parseDocumentType(Node node0, ParseContext context) {
		DocumentType node = (DocumentType) node0;
		if (node.getPublicId() != null) {
			context.append("<!DOCTYPE ");
			context.append(node.getNodeName());
			context.append(" PUBLIC \"");
			context.append(node.getPublicId());
			context.append("\" \"");
			context.append(node.getSystemId());
			context.append("\">");
		} else {
			context.append("<!DOCTYPE ");
			context.append(node.getNodeName());
			context.append("[");
			context.append(node.getInternalSubset());
			context.append("]>");
		}
		context.appendFormatEnd();
		return true;
	}

	private boolean parseDocument(Node node, ParseContext context) {
		for (Node n = node.getFirstChild(); n != null; n = n.getNextSibling()) {
			this.parser.parseNode(n, context);
		}
		return true;
	}

	private boolean parseComment(Node node, ParseContext context) {
		return true;// not support
	}

	private boolean parseEntity(Node node, ParseContext context) {
		throw new UnsupportedOperationException("parseNotation not support");
	}

	private boolean parseEntityReference(Node node, ParseContext context) {
		context.append("&");
		context.append(node.getNodeName());
		context.append(";");
		return true;
	}

	private boolean parseTextNode(Node node, ParseContext context) {
		String text = ((Text) node).getData();
		if (!context.isReserveSpace()) {
			text = text.trim();
		}
		if (text.length() > 0) {
			boolean format = (node.getPreviousSibling() != null || node
					.getNextSibling() != null);
			if (format) {
				context.appendFormatIndent();
			}
			context.appendList(this.parser.parseText(text, true, false, 0));
			if (format) {
				context.appendFormatEnd();
			}
		}
		return true;
	}

	private boolean parseAttribute(Node node, ParseContext context) {
		Attr attr = (Attr) node;
		String name = attr.getName();
		String value = attr.getValue();
		if ("xmlns:c".equals(name)
				&& ("#".equals(value) || "#core".equals(value))
				|| value.equals(TEMPLATE_NAMESPACE)) {
			return true;
		}
		List<Object> buf = this.parser.parseText(value, true, true, '"');
		boolean isStatic = false;
		boolean isDynamic = false;
		// hack parseText is void
		int i = buf.size();
		while (i-- > 0) {
			// hack reuse value param
			Object item = buf.get(i);
			if (item instanceof String) {
				if (((String) item).length() > 0) {
					isStatic = true;
				} else {
					buf.remove(i);
				}
			} else {
				isDynamic = true;
			}
		}
		if (isDynamic && !isStatic) {
			// remove attribute;
			// context.append(" "+name+'=""');
			if (buf.size() > 1) {
				// TODO:....
				throw new RuntimeException("只能有单个EL表达式");
			} else {// 只考虑单一EL表达式的情况
				Object[] el = (Object[]) buf.get(0);
				context.append(new Object[] { Template.ATTRIBUTE_TYPE, el[1],
						name });
				return true;
			}
		}
		context.append(" " + name + "=\"");
		if (name.startsWith("xmlns")) {
			if (buf.size() == 1
					&& "http://www.xidea.org/ns/template/xhtml".equals(buf
							.get(0))) {
				buf.set(0, "http://www.w3.org/1999/xhtml");
			}
		}
		context.appendList(buf);
		context.append("\"");
		return true;
	}

	private boolean parseElement(Node node, ParseContext context) {
		context.appendFormatIndent();
		Element el = (Element) node;
		NamedNodeMap attributes = node.getAttributes();
		String tagName = el.getTagName();
		context.append("<" + tagName);
		for (int i = 0; i < attributes.getLength(); i++) {
			this.parser.parseNode(attributes.item(i), context);
		}
		Node next = node.getFirstChild();
		if (next != null) {
			context.append(">");
			boolean format = next.getNodeType() != Node.TEXT_NODE
					|| next.getNextSibling() != null;
			if (format) {
				context.appendFormatEnd();
			}
			do {
				this.parser.parseNode(next, context);
			} while ((next = next.getNextSibling()) != null);
			if (format) {
				context.appendFormatIndent();
			}
			context.append("</" + tagName + '>');
			context.appendFormatEnd();
		} else {
			context.append("/>");
			context.appendFormatEnd();
			return true;
		}

		return true;
	}
}