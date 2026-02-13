export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",         // Bright Blue (Tailwind Blue-500)
        secondary: "#1e293b",       // Slate-800
        "app-bg": "#0f172a",        // Slate-900 (Deep Blue-Black)
        "panel-bg": "#1e293b",      // Sidebar
        "chat-bg": "#0f172a",       // Main Chat
        "outgoing-bubble": "#2563eb", // Blue-600 (Brighter)
        "incoming-bubble": "#1e293b", // Slate-800 (Darker for depth, contrasting with text) -> Wait, text is white. Slate-800 is dark.
        // Let's make incoming bubble Lighter than background. Background is Slate-900.
        // Incoming should be Slate-800 or Slate-700.
        // Let's try:
        //"incoming-bubble": "#334155", // Slate-700 (Existing) is good.
        // Let's try a slightly different shade.
        "incoming-bubble": "#1e293b", // Matches sidebar.
        // User said "according to theme".
        // Let's make Outgoing a gradient-like blue and Incoming a solid dark slate.
        "outgoing-bubble": "#3b82f6", // Blue-500 (Primary color)
        "incoming-bubble": "#1f2937", // Gray-800
        "text-primary": "#f8fafc",  // Slate-50
        "text-secondary": "#94a3b8", // Slate-400
        "input-bg": "#334155",      // Input matches incoming bubble
        "message-blue": "#60a5fa",  // Lighter blue checks
      },

    },
  },
  plugins: [],
};
