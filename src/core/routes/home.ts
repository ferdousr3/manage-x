import type { Context } from 'hono'

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Manage-X API</title>
   <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
         min-height: 100vh;
         display: flex;
         align-items: center;
         justify-content: center;
         background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
         color: #fff;
      }
      .container {
         text-align: center;
         padding: 3rem;
         background: rgba(255, 255, 255, 0.05);
         border-radius: 20px;
         backdrop-filter: blur(10px);
         border: 1px solid rgba(255, 255, 255, 0.1);
         box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      }
      .status-icon {
         width: 100px;
         height: 100px;
         background: linear-gradient(135deg, #00d9a5 0%, #00b894 100%);
         border-radius: 50%;
         display: flex;
         align-items: center;
         justify-content: center;
         margin: 0 auto 2rem;
         animation: pulse 2s infinite;
      }
      .status-icon::before {
         content: "✓";
         font-size: 3rem;
         color: #fff;
      }
      @keyframes pulse {
         0%, 100% { box-shadow: 0 0 0 0 rgba(0, 217, 165, 0.4); }
         50% { box-shadow: 0 0 0 20px rgba(0, 217, 165, 0); }
      }
      .links {
         display: flex;
         gap: 1rem;
         justify-content: center;
      }
      .links a {
         color: #00d9a5;
         text-decoration: none;
         padding: 0.75rem 1.5rem;
         border: 1px solid #00d9a5;
         border-radius: 8px;
         transition: all 0.3s ease;
         font-weight: 500;
      }
      .links a:hover {
         background: #00d9a5;
         color: #1a1a2e;
      }
   </style>
</head>
<body>
   <div class="container">
      <div class="status-icon"></div>

   </div>
</body>
</html>`

export const homeHandler = (c: Context) => {
   return c.html(html)
}
