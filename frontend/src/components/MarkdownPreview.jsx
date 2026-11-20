import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./MarkdownPreview.css";

// Markdown ko safe HTML mein dikhata hai (headings, lists, links, code, tables)
const MarkdownPreview = ({ content, empty = "Nothing to preview yet." }) => (
  <div className="markdown-body">
    {content && content.trim() ? (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    ) : (
      <p className="md-empty">{empty}</p>
    )}
  </div>
);

export default MarkdownPreview;