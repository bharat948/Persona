/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
"./src/**/*.{html,ts}",
],
darkMode: 'class', // Enable dark mode with class strategy
theme: {
extend: {
colors: {
// Agent Registration Theme
'primary-registration': '#3498db',
'bg-light-registration': '#ecf0f1',
'bg-dark-registration': '#101922',
'text-light-registration': '#34495e',
'text-dark-registration': '#ecf0f1',

// MCP Server Catalog Theme
'primary-catalog': '#3B82F6',
'bg-light-catalog': '#F3F4F6',
'bg-dark-catalog': '#1F2937',

// Tool Integration Theme
'primary-integration': '#4A90E2',
'bg-light-integration': '#F5F7FA',
'bg-dark-integration': '#101922',
'accent-integration': '#50E3C2',

// Agent Catalog Theme
'primary-agent-catalog': '#137fec',
'bg-light-agent-catalog': '#f6f7f8',
'bg-dark-agent-catalog': '#101922',

// Agent Chat Theme
'primary-chat': '#4A90E2',
'bg-light-chat': '#F7F7F7',
'bg-dark-chat': '#101922',
'user-message': '#D0E4F9',
'agent-message': '#EAEAEA',
},
fontFamily: {
'display': ['Inter', 'sans-serif'],
},
borderRadius: {
'DEFAULT': '0.25rem',
'lg': '0.5rem',
'xl': '0.75rem',
'full': '9999px',
},
},
},
plugins: [
require('@tailwindcss/forms'),
require('@tailwindcss/container-queries'),
],
}
