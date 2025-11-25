// =================================================================================
//  项目: lexica-2api (Cloudflare Worker 单文件版)
//  版本: 3.1.0 (代号: Full Featured)
//  作者: 首席AI执行官
//  更新内容: 
//    1. 保留 Base64/URL 深度搜索算法 (核心修复)
//    2. 完整保留 /v1/models 模型列表接口
//    3. 修复 UI 界面模型选择显示
//    4. 优化 API 响应头，适配更多第三方客户端
// =================================================================================

// --- [第一部分: 核心配置] ---
const CONFIG = {
  PROJECT_NAME: "lexica-2api-v3.1",
  API_MASTER_KEY: "1", // 你的访问密钥，可自行修改
  
  // 上游配置
  ENDPOINT_WORKFLOW: "https://lexicaai.net/workflow/start",
  
  // --- 模型定义 (不要割舍，客户端需要读取这个列表) ---
  MODELS: [
      "lexica-v2", 
      "lexica-aperture"
  ],
  DEFAULT_MODEL: "lexica-v2",

  // --- 凭证 (来自抓包) ---
  HEADERS: {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "content-type": "application/json",
    "origin": "https://lexicaai.net",
    "referer": "https://lexicaai.net/",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    "x-bubble-appname": "lexica-ai",
    "x-bubble-breaking-revision": "5",
    "x-bubble-client-version": "d0f9bbf36a0d3aa20a11d33c4d933f5824d8abf6",
    "x-bubble-platform": "web",
    "x-requested-with": "XMLHttpRequest"
  },
  
  // Cookie (请确保有效)
  COOKIE: `lexica-ai_live_u2main=bus|1764050080652x853479239511027100|1764050080662x935074263972595000; lexica-ai_live_u2main.sig=hg1nPmDc7iy1yvLzCTuKhMGAcnE; lexica-ai_u1main=1764050080652x853479239511027100; _ga=GA1.1.908209093.1764050088; _ga_3242TDGB9K=GS2.1.s1764050087$o1$g1$t1764052040$j60$l0$h0`
};

// --- [第二部分: Worker 入口] ---
export default {
  async fetch(request, env, ctx) {
    const apiKey = env.API_MASTER_KEY || CONFIG.API_MASTER_KEY;
    const url = new URL(request.url);

    // 处理 CORS 预检请求 (让浏览器和第三方客户端不报错)
    if (request.method === 'OPTIONS') return handleCorsPreflight();

    // 路由分发
    if (url.pathname === '/') return handleUI(request, apiKey); // 网页版 UI
    if (url.pathname === '/v1/models') return handleModels();   // 模型列表接口
    if (url.pathname === '/v1/chat/completions') return handleChat(request); // 核心对话接口
    
    return createErrorResponse(`未找到路径: ${url.pathname}`, 404);
  }
};

// --- [第三部分: API 逻辑] ---

// 1. 模型列表接口 (客户端获取模型列表用)
function handleModels() {
  const models = CONFIG.MODELS.map(id => ({
    id: id,
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'lexica-api',
    permission: [],
    root: id,
    parent: null
  }));

  return new Response(JSON.stringify({
    object: 'list',
    data: models
  }), { headers: corsHeaders({ 'Content-Type': 'application/json' }) });
}

// 2. 构造 Bubble Payload
function buildPayload(prompt) {
    const ts = Date.now();
    const runId = `${ts + 2000}x${Math.floor(Math.random() * 1e17)}`;
    const serverCallId = `${ts + 2002}x${Math.floor(Math.random() * 1e17)}`;
    
    return {
        "wait_for": [],
        "app_last_change": "39058753574",
        "client_breaking_revision": 5,
        "calls": [{
            "client_state": {
                "element_instances": {
                    "bTHPg": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTHPg", "parent_element_id": "bTHQD" },
                    "bTHRB": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTHRB", "parent_element_id": "bTHQv" },
                    "bTHPU": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTHPU", "parent_element_id": "bTHQD" },
                    "bTHQt": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTHQt", "parent_element_id": "bTHQn" },
                    "bTHQh": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTHQh", "parent_element_id": "bTHQV" },
                    "bTIYi": "NOT_FOUND",
                    "bTJLW0": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTJLW0", "parent_element_id": "bTGYf" },
                    "bTHQD": { "dehydrated": "1348695171700984260__LOOKUP__ElementInstance::bTHQD", "parent_element_id": "bTHPO" }
                },
                "element_state": {
                    "1348695171700984260__LOOKUP__ElementInstance::bTHRB": { "is_visible": false, "value": "1:1" },
                    "1348695171700984260__LOOKUP__ElementInstance::bTHPU": { "is_visible": true, "value_that_is_valid": prompt, "value": prompt },
                    "1348695171700984260__LOOKUP__ElementInstance::bTHQt": { "is_visible": false, "value": "Standard" },
                    "1348695171700984260__LOOKUP__ElementInstance::bTHQh": { "is_visible": false, "value": "Photorealistic" },
                    "1348695171700984260__LOOKUP__ElementInstance::bTHQD": { "group_data": null }
                },
                "other_data": { "Current Page Scroll Position": 0, "Current Page Width": 909 },
                "cache": {
                    "CurrentUser": "1348695171700984260__LOOKUP__1764050080652x853479239511027100",
                    "1508b6768b6645b0b8364c7daab11a1c": true,
                    "93ba2c6a5eeb59c1b3c41cf8220fb7f1": false
                },
                "exists": { "CurrentUser": true, "1508b6768b6645b0b8364c7daab11a1c": true, "93ba2c6a5eeb59c1b3c41cf8220fb7f1": true }
            },
            "run_id": runId,
            "server_call_id": serverCallId,
            "item_id": "bTIkh",
            "element_id": "bTHPg",
            "page_id": "bTGYf",
            "uid_generator": { "timestamp": ts, "seed": Math.floor(Math.random() * 1e18) },
            "random_seed": Math.random(),
            "current_date_time": ts + 159,
            "current_wf_params": {}
        }],
        "timezone_offset": -480,
        "timezone_string": "Asia/Shanghai",
        "user_id": "1764050080652x853479239511027100",
        "should_stream": false,
        "platform": "web"
    };
}

// 3. 核心：深度递归查找图片 (支持 URL 和 Base64)
function recursiveFindImage(obj, depth = 0) {
    if (!obj || depth > 10) return null; 

    // 检查 Base64 字段
    if (obj.hasOwnProperty('_api_c2_bytesBase64Encoded') && typeof obj['_api_c2_bytesBase64Encoded'] === 'string') {
        const base64 = obj['_api_c2_bytesBase64Encoded'];
        if (base64.length > 100) {
            return `data:image/png;base64,${base64}`;
        }
    }

    // 检查 URL 字符串
    if (typeof obj === 'string') {
        if (obj.includes('cdn.bubble.io') && /\.(png|jpg|jpeg|webp|avif)(\?|$)/i.test(obj)) {
            return obj.startsWith('//') ? 'https:' + obj : obj;
        }
        return null;
    }

    if (typeof obj !== 'object') return null;

    // 递归遍历
    for (const key in obj) {
        const val = obj[key];
        if (key === 'image1_image' && typeof val === 'string') {
             return val.startsWith('//') ? 'https:' + val : val;
        }
        const found = recursiveFindImage(val, depth + 1);
        if (found) return found;
    }
    return null;
}

// 4. 轮询逻辑
async function pollForImage(slug, writer, encoder, isWebUI) {
    const maxAttempts = 30; 
    const delayMs = 2500;
    const targetUrl = `https://lexicaai.net/api/1.1/init/data?location=https%3A%2F%2Flexicaai.net%2Fgenerate%2F${slug}`;
    
    if (isWebUI) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ debug: [{ step: "Polling Start", data: { slug, url: targetUrl } }] })}\n\n`));
    }

    for (let i = 0; i < maxAttempts; i++) {
        try {
            const res = await fetch(targetUrl, {
                method: "GET",
                headers: { ...CONFIG.HEADERS, "cookie": CONFIG.COOKIE }
            });
            
            if (!res.ok) continue;
            
            const data = await res.json();
            const imgUrl = recursiveFindImage(data);

            if (imgUrl) {
                if (isWebUI) {
                    const logUrl = imgUrl.startsWith('data:') ? '[Base64 Image Data Found]' : imgUrl;
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ debug: [{ step: "Polling Success", data: { imgUrl: logUrl } }] })}\n\n`));
                }
                return imgUrl;
            }
            
            if (isWebUI && i % 5 === 0) {
                 await writer.write(encoder.encode(`data: ${JSON.stringify({ debug: [{ step: `Polling Attempt ${i+1}`, status: "Scanning..." }] })}\n\n`));
            }

        } catch (e) { }
        await new Promise(r => setTimeout(r, delayMs));
    }
    return null;
}

// 5. 核心对话处理
async function handleChat(request) {
    // 鉴权
    const authHeader = request.headers.get('Authorization');
    const apiKey = CONFIG.API_MASTER_KEY;
    if (apiKey && apiKey !== "1") {
        if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.substring(7) !== apiKey) {
            return createErrorResponse('鉴权失败 (Unauthorized)', 401);
        }
    }

    const requestId = `chatcmpl-${crypto.randomUUID()}`;
    let body = {};
    try { body = await request.json(); } catch(e) {}
    
    const messages = body.messages || [];
    const lastMsg = messages.reverse().find(m => m.role === 'user');
    const prompt = lastMsg ? lastMsg.content : "Hello";
    const isWebUI = body.is_web_ui === true;
    
    // 获取用户请求的模型，如果不在列表中则使用默认
    let requestModel = body.model || CONFIG.DEFAULT_MODEL;
    if (!CONFIG.MODELS.includes(requestModel)) {
        requestModel = CONFIG.DEFAULT_MODEL;
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
        try {
            // 1. 构造请求
            const payload = buildPayload(prompt);
            const ts = Date.now();
            const fiberId = `${ts+1000}x${Math.floor(Math.random()*1e17)}`;
            const plId = `${ts}x${Math.floor(Math.random()*1000)}`;

            const headers = {
                ...CONFIG.HEADERS,
                "cookie": CONFIG.COOKIE,
                "x-bubble-fiber-id": fiberId,
                "x-bubble-pl": plId
            };

            if (isWebUI) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ debug: [{ step: "Payload", data: payload }] })}\n\n`));
            }

            // 2. 发送提交请求
            const res = await fetch(CONFIG.ENDPOINT_WORKFLOW, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`Upstream ${res.status}: ${await res.text()}`);
            
            const data = await res.json();
            
            if (isWebUI) {
                const debugData = JSON.parse(JSON.stringify(data));
                if(JSON.stringify(debugData).length > 2000) debugData.truncated = true;
                await writer.write(encoder.encode(`data: ${JSON.stringify({ debug: [{ step: "Response", data: debugData }] })}\n\n`));
            }

            // 3. 尝试提取图片或 Slug
            let imageUrl = recursiveFindImage(data);
            let slug = null;

            if (!imageUrl) {
                try {
                    const findSlug = (obj) => {
                        if (!obj || typeof obj !== 'object') return null;
                        if (obj.slug && typeof obj.slug === 'string') return obj.slug;
                        for (const k in obj) {
                            const found = findSlug(obj[k]);
                            if (found) return found;
                        }
                        return null;
                    };
                    slug = findSlug(data);
                } catch(e) {}
            }

            // 发送初始消息 (包含模型名称)
            const initialContent = imageUrl 
                ? `🚀 **生成成功 (即时)**\n\n正在渲染...` 
                : (slug ? `🚀 **任务已提交**\n\n正在轮询 (Slug: \`${slug}\`)...` : `🚀 **任务已提交**\n\n正在解析响应...`);

            await writer.write(encoder.encode(`data: ${JSON.stringify({
                id: requestId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now()/1000),
                model: requestModel, // 返回正确的模型名称
                choices: [{ index: 0, delta: { content: initialContent }, finish_reason: null }]
            })}\n\n`));

            // 4. 轮询
            if (!imageUrl && slug) {
                imageUrl = await pollForImage(slug, writer, encoder, isWebUI);
            }

            // 5. 最终结果
            let finalContent = "";
            if (imageUrl) {
                finalContent = `\n\n✅ **生成成功**\n\n![Generated Image](${imageUrl})`;
                if (!imageUrl.startsWith('data:')) {
                    finalContent += `\n\n[查看原图](${imageUrl})`;
                }
            } else {
                finalContent = `\n\n⚠️ **生成超时或失败**\n\n未能从响应中提取到图片链接或 Base64 数据。`;
            }

            // 发送最终内容 (包含模型名称)
            await writer.write(encoder.encode(`data: ${JSON.stringify({
                id: requestId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now()/1000),
                model: requestModel, // 再次确认模型名称
                choices: [{ index: 0, delta: { content: finalContent }, finish_reason: null }]
            })}\n\n`));

            await writer.write(encoder.encode(`data: ${JSON.stringify({
                id: requestId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now()/1000),
                model: requestModel,
                choices: [{ index: 0, delta: {}, finish_reason: 'stop' }]
            })}\n\n`));
            await writer.write(encoder.encode('data: [DONE]\n\n'));

        } catch (e) {
            const errChunk = {
                id: requestId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now()/1000),
                model: requestModel,
                choices: [{ index: 0, delta: { content: `\n\nError: ${e.message}` }, finish_reason: 'stop' }]
            };
            await writer.write(encoder.encode(`data: ${JSON.stringify(errChunk)}\n\n`));
            await writer.write(encoder.encode('data: [DONE]\n\n'));
        } finally {
            await writer.close();
        }
    })();

    return new Response(readable, { headers: corsHeaders({ 'Content-Type': 'text/event-stream' }) });
}

function createErrorResponse(msg, status) {
    return new Response(JSON.stringify({ error: { message: msg } }), { status, headers: corsHeaders({'Content-Type': 'application/json'}) });
}
function handleCorsPreflight() { return new Response(null, { status: 204, headers: corsHeaders() }); }
function corsHeaders(h={}) { return { ...h, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*' }; }

// --- [第四部分: 开发者驾驶舱 UI] ---
function handleUI(request, apiKey) {
  const origin = new URL(request.url).origin;
  const clientConfig = {
      WORKER_ORIGIN: origin,
      API_MASTER_KEY: apiKey,
      DEFAULT_MODEL: CONFIG.DEFAULT_MODEL,
      MODELS: CONFIG.MODELS
  };
  const configBase64 = btoa(JSON.stringify(clientConfig));

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 驾驶舱</title>
    <style>
      :root { --bg: #0f172a; --panel: #1e293b; --text: #f1f5f9; --primary: #3b82f6; --accent: #10b981; --err: #ef4444; --code-bg: #020617; }
      body { font-family: 'Segoe UI', monospace; background: var(--bg); color: var(--text); margin: 0; height: 100vh; display: flex; overflow: hidden; }
      .container { display: flex; width: 100%; height: 100%; }
      .left-panel { width: 40%; padding: 20px; display: flex; flex-direction: column; border-right: 1px solid #334155; overflow-y: auto; }
      .right-panel { width: 60%; padding: 20px; display: flex; flex-direction: column; background: var(--code-bg); }
      .box { background: var(--panel); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #334155; }
      .label { font-size: 12px; color: #94a3b8; margin-bottom: 5px; display: block; font-weight: bold; }
      input, textarea, select { width: 100%; background: var(--bg); border: 1px solid #475569; color: #fff; padding: 10px; border-radius: 6px; box-sizing: border-box; margin-bottom: 10px; font-family: monospace; }
      button { width: 100%; padding: 12px; background: var(--primary); border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; transition: 0.2s; }
      button:hover { opacity: 0.9; }
      button:disabled { background: #475569; cursor: not-allowed; }
      .chat-window { flex: 1; background: var(--bg); border: 1px solid #334155; border-radius: 8px; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
      .msg { padding: 10px 14px; border-radius: 8px; line-height: 1.5; font-size: 14px; max-width: 90%; word-break: break-word; }
      .msg.user { align-self: flex-end; background: var(--primary); color: white; }
      .msg.ai { align-self: flex-start; background: var(--panel); border: 1px solid #334155; }
      .msg.ai img { max-width: 100%; border-radius: 6px; margin-top: 10px; display: block; }
      .msg.ai a { color: var(--accent); }
      .log-window { flex: 1; overflow-y: auto; font-family: 'Consolas', monospace; font-size: 12px; color: #a5b4fc; white-space: pre-wrap; word-break: break-all; }
      .log-entry { margin-bottom: 10px; border-bottom: 1px solid #1e293b; padding-bottom: 10px; }
      .log-key { color: var(--accent); font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="left-panel">
            <h3>🛸 ${CONFIG.PROJECT_NAME}</h3>
            <div class="box">
                <span class="label">API Endpoint</span>
                <input type="text" id="api-url" readonly onclick="this.select()">
                <span class="label">API Key</span>
                <input type="text" id="api-key" readonly onclick="this.select()">
            </div>
            <div class="box">
                <span class="label">模型选择 (Model)</span>
                <select id="model"></select>
            </div>
            <div class="chat-window" id="chat">
                <div style="text-align:center; color:#64748b; margin-top:20px;">Lexica 代理就绪</div>
            </div>
            <div class="box" style="margin-bottom:0">
                <textarea id="prompt" rows="3" placeholder="输入提示词 (例如: a cute cat)...">a cute cat</textarea>
                <button id="btn" onclick="send()">生成图片</button>
            </div>
        </div>
        <div class="right-panel">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span class="label" style="font-size:14px; color:#fff;">📡 实时调试日志</span>
                <button onclick="document.getElementById('logs').innerHTML=''" style="width:auto; padding:5px 10px; background:#334155;">清空</button>
            </div>
            <div class="log-window" id="logs">
                <div style="color:#64748b;">等待请求...</div>
            </div>
        </div>
    </div>
    <script>
        const CFG = JSON.parse(atob("${configBase64}"));
        document.getElementById('api-url').value = CFG.WORKER_ORIGIN + '/v1/chat/completions';
        document.getElementById('api-key').value = CFG.API_MASTER_KEY;
        
        // 动态填充模型列表
        const modelSel = document.getElementById('model');
        CFG.MODELS.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.text = m;
            if(m === CFG.DEFAULT_MODEL) opt.selected = true;
            modelSel.appendChild(opt);
        });

        function appendLog(step, data) {
            const div = document.createElement('div');
            div.className = 'log-entry';
            const time = new Date().toLocaleTimeString();
            const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            div.innerHTML = \`<div><span style="color:#64748b">[\${time}]</span> <span class="log-key">\${step}</span></div><div>\${content}</div>\`;
            const logs = document.getElementById('logs');
            logs.appendChild(div);
            logs.scrollTop = logs.scrollHeight;
        }

        function appendChat(role, html) {
            const div = document.createElement('div');
            div.className = 'msg ' + role;
            div.innerHTML = html;
            const chat = document.getElementById('chat');
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
            return div;
        }

        function parseMarkdown(text) {
            let html = text.replace(/!\\[(.*?)\\]\\((.*?)\\)/g, '<img src="$2" alt="$1">');
            html = html.replace(/\\[(.*?)\\]\\((.*?)\\)/g, '<a href="$2" target="_blank">$1</a>');
            html = html.replace(/\\n/g, '<br>');
            return html;
        }

        async function send() {
            const input = document.getElementById('prompt');
            const val = input.value.trim();
            if (!val) return;
            
            const btn = document.getElementById('btn');
            btn.disabled = true;
            btn.innerText = "请求中...";
            
            document.getElementById('logs').innerHTML = ''; 
            
            appendChat('user', val);
            const aiMsg = appendChat('ai', '正在提交任务...');
            
            try {
                const res = await fetch(CFG.WORKER_ORIGIN + '/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + CFG.API_MASTER_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        model: modelSel.value, // 使用选择的模型
                        messages: [{role: 'user', content: val}], 
                        stream: true, 
                        is_web_ui: true 
                    })
                });

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonStr = line.slice(6);
                            if (jsonStr === '[DONE]') break;
                            try {
                                const json = JSON.parse(jsonStr);
                                if (json.debug) {
                                    json.debug.forEach(log => appendLog(log.step, log.data));
                                    continue;
                                }
                                const content = json.choices[0].delta.content;
                                if (content) {
                                    fullText += content;
                                    aiMsg.innerHTML = parseMarkdown(fullText);
                                }
                            } catch (e) {}
                        }
                    }
                }
            } catch (e) {
                aiMsg.innerText = 'Error: ' + e.message;
                appendLog("Client Error", e.message);
            } finally {
                btn.disabled = false;
                btn.innerText = "生成图片";
            }
        }
    <\/script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
