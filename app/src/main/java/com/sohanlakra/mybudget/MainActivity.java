package com.sohanlakra.mybudget;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.*;

public class MainActivity extends Activity {
    private WebView webView;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        webView = new WebView(this);
        setContentView(webView);
        WebSettings s=webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        webView.addJavascriptInterface(new NativeBridge(),"AndroidBridge");
        webView.loadUrl("file:///android_asset/index.html");
    }

    public class NativeBridge {
        @JavascriptInterface public void post(String url,String json,String callback) {
            executor.execute(() -> {
                String result;
                try {
                    HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();
                    c.setRequestMethod("POST");
                    c.setConnectTimeout(20000); c.setReadTimeout(30000);
                    c.setDoOutput(true);
                    c.setRequestProperty("Content-Type","text/plain;charset=utf-8");
                    byte[] body=json.getBytes(StandardCharsets.UTF_8);
                    c.setFixedLengthStreamingMode(body.length);
                    try(OutputStream o=c.getOutputStream()){o.write(body);}
                    InputStream is=c.getResponseCode()>=400?c.getErrorStream():c.getInputStream();
                    BufferedReader r=new BufferedReader(new InputStreamReader(is,StandardCharsets.UTF_8));
                    StringBuilder sb=new StringBuilder(); String line;
                    while((line=r.readLine())!=null) sb.append(line);
                    result=sb.toString(); c.disconnect();
                } catch(Exception e) {
                    result="{\"ok\":false,\"error\":\""+e.toString().replace("\\","\\\\").replace("\"","\\\"")+"\"}";
                }
                final String js=callback+"('"+result.replace("\\","\\\\").replace("'","\\'").replace("\n","\\n").replace("\r","\\r")+"')";
                runOnUiThread(() -> webView.evaluateJavascript(js,null));
            });
        }
    }
    @Override public void onBackPressed(){if(webView.canGoBack())webView.goBack();else super.onBackPressed();}
    @Override protected void onDestroy(){executor.shutdownNow();webView.destroy();super.onDestroy();}
}
