import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TiptapUnderline from "@tiptap/extension-underline";
import TiptapImage from "@tiptap/extension-image";
import {
  Save,
  Eye,
  Upload,
  Download,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Code,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/utils/themeClasses";

/**
 * PolicyEditor Component
 * Rich text editor for creating and editing policy documents using Tiptap
 */

const PolicyEditor = ({
  initialContent = "",
  onSave,
  onPublish,
  policyType,
  currentVersion = null,
  loading = false,
  readOnly = false,
}) => {
  const { isDarkMode } = useTheme();
  const [showPreview, setShowPreview] = useState(false);
  const [isMajorVersion, setIsMajorVersion] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TiptapUnderline,
      TiptapImage,
    ],
    content: initialContent,
    editable: !readOnly && !showPreview,
  });

  const handleSave = async (publish = false) => {
    if (!editor) return;

    const content = editor.getHTML();
    if (!content.trim() || content === "<p></p>") {
      alert("Policy content cannot be empty");
      return;
    }

    if (publish) {
      await onPublish?.({ content, isMajorVersion });
    } else {
      await onSave?.({ content, isMajorVersion });
    }
  };

  const exportContent = () => {
    if (!editor) return;
    const content = editor.getHTML();
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${policyType}_${currentVersion || "draft"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  const MenuButton = ({ onClick, active, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={readOnly || showPreview}
      title={title}
      className={`p-2 rounded transition-colors ${
        active
          ? isDarkMode
            ? "bg-violet-600 text-white"
            : "bg-gray-900 text-white"
          : isDarkMode
          ? "hover:bg-slate-700 text-slate-300"
          : "hover:bg-gray-200 text-gray-700"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-[10px] border ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
            {policyType?.replace(/_/g, " ")}
          </span>
          {currentVersion && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isDarkMode ? "bg-violet-600/20 text-violet-400" : "bg-gray-200 text-gray-700"
              }`}
            >
              v{currentVersion}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isMajorVersion}
                  onChange={(e) => setIsMajorVersion(e.target.checked)}
                  className="rounded"
                />
                <span className={getThemeClasses.text.secondary(isDarkMode)}>
                  Major version
                </span>
              </label>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm ${
                  isDarkMode
                    ? "bg-slate-700 hover:bg-slate-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                <Eye className="w-4 h-4" />
                {showPreview ? "Edit" : "Preview"}
              </button>

              <button
                onClick={exportContent}
                className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm ${
                  isDarkMode
                    ? "bg-slate-700 hover:bg-slate-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={() => handleSave(false)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } disabled:opacity-50`}
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>

              <button
                onClick={() => handleSave(true)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm ${
                  isDarkMode
                    ? "bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700 text-white"
                    : "bg-gray-900 hover:bg-gray-800 text-white"
                } disabled:opacity-50`}
              >
                <Upload className="w-4 h-4" />
                Publish
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor Menu */}
      {!showPreview && !readOnly && (
        <div
          className={`flex flex-wrap gap-1 p-2 rounded-[10px] border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-300"
          }`}
        >
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </MenuButton>

          <div className={`w-px h-8 ${isDarkMode ? "bg-slate-700" : "bg-gray-300"}`}></div>

          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <span className="text-sm font-bold">H1</span>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <span className="text-sm font-bold">H2</span>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <span className="text-sm font-bold">H3</span>
          </MenuButton>

          <div className={`w-px h-8 ${isDarkMode ? "bg-slate-700" : "bg-gray-300"}`}></div>

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>

          <div className={`w-px h-8 ${isDarkMode ? "bg-slate-700" : "bg-gray-300"}`}></div>

          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </MenuButton>

          <div className={`w-px h-8 ${isDarkMode ? "bg-slate-700" : "bg-gray-300"}`}></div>

          <MenuButton onClick={addLink} title="Add Link">
            <Link2 className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={addImage} title="Add Image">
            <ImageIcon className="w-4 h-4" />
          </MenuButton>

          <div className={`w-px h-8 ${isDarkMode ? "bg-slate-700" : "bg-gray-300"}`}></div>

          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>
        </div>
      )}

      {/* Editor / Preview */}
      <div
        className={`min-h-[500px] p-6 rounded-[10px] border ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-300"
        }`}
      >
        <style>
          {`
            .ProseMirror {
              min-height: 450px;
              outline: none;
              font-size: 16px;
              line-height: 1.6;
            }
            .ProseMirror p {
              margin-bottom: 1em;
            }
            .ProseMirror h1 {
              font-size: 2em;
              font-weight: bold;
              margin: 0.67em 0;
            }
            .ProseMirror h2 {
              font-size: 1.5em;
              font-weight: bold;
              margin: 0.75em 0;
            }
            .ProseMirror h3 {
              font-size: 1.17em;
              font-weight: bold;
              margin: 0.83em 0;
            }
            .ProseMirror ul, .ProseMirror ol {
              padding-left: 2em;
              margin: 1em 0;
            }
            .ProseMirror li {
              margin: 0.5em 0;
            }
            .ProseMirror code {
              background-color: ${isDarkMode ? "#1e293b" : "#f1f5f9"};
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-family: monospace;
            }
            .ProseMirror a {
              color: ${isDarkMode ? "#a78bfa" : "#4f46e5"};
              text-decoration: underline;
            }
            .ProseMirror img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 1em 0;
            }
            .ProseMirror strong {
              font-weight: bold;
            }
            .ProseMirror em {
              font-style: italic;
            }
            .ProseMirror u {
              text-decoration: underline;
            }
            .ProseMirror s {
              text-decoration: line-through;
            }
            ${isDarkMode ? `
              .ProseMirror {
                color: #e2e8f0;
              }
            ` : `
              .ProseMirror {
                color: #1f2937;
              }
            `}
          `}
        </style>
        <EditorContent editor={editor} />
      </div>

      {/* Word count */}
      <div className={`text-right text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
        {editor.getText().trim().split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );
};

export default PolicyEditor;
