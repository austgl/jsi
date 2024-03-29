package org.xidea.jsi.web.test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;

import org.junit.Assert;
import org.junit.Test;
import org.xidea.jsi.impl.v2.JSIText;
import org.xidea.jsi.impl.v2.RuntimeSupport;
import org.xidea.jsi.web.JSIService;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;


public class JSIServiceTest  extends JSIService{
	private BASE64Encoder encoder = new BASE64Encoder();
	private BASE64Decoder decoder = new BASE64Decoder();
	

	@Test
	public void testExecute() throws IOException {
		char[] cs = new char[100];
		for(char i = 0;i<100;i++){
			cs[i] = (char) (i+40);
		}

		System.out.println(new String(cs));
		testData("aaaa");
		testData("13333a");
		testData("13333ahefieodwaiueiamfnaehry--oiw=");
		testData("1");
		testData("12");
		testData("123");
		testData("1234");
		testData("12121213");
		testData("1212124313");
		testData("1212134535213");
		testData("123");
		testData("1444");
		testRadom();
		for (int i = 0; i <1000; i++) {
			testRadom();
		}
	}


	private void testRadom() throws IOException {
		int p = (int)(Math.random() *100);
		StringBuilder buf = new StringBuilder();
		for(int i=0;i<p;i++){
			buf.append((char)(Math.random() *256));
		}
		testData(buf.toString());
		
	}


	private void testData(String input) throws IOException {
		String base64 = encoder.encode(input.getBytes());
		//System.out.println(input);
		//System.out.println(base64);
		ByteArrayOutputStream out1 = new ByteArrayOutputStream();
		JSIText.writeBase64(base64, out1);
		byte[] outbyte2 = decoder.decodeBuffer(base64);
		//System.out.println(new String(outbyte2));
		//System.out.println(new String(out1.toByteArray()));
		Assert.assertArrayEquals(outbyte2,out1.toByteArray());
	}
	@Test
	public void testSDN() throws IOException{
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		new JSIService().service("/scripts/=org.xidea.jsidoc.util:Zip", new HashMap<String, String[]>(), out, "SDN_DEBUG=1");
		String text = out.toString("utf-8");
		RuntimeSupport.create().eval("function(){"+text+"\n}");
		System.out.println(text);
	}

}
