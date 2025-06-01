import React, { useCallback, useMemo, useState, useEffect } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import type { CSSProperties } from "react";
import { useDebounce } from "@/hooks/useDebounce";

// Register languages
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("jsx", jsx);

interface CodeEditorProps {
  initialValue?: string;
  language?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  height?: string;
  showLineNumbers?: boolean;
}

// Memoized language detection
const detectLanguage = (code: string): string => {
  if (
    code.includes("interface") ||
    code.includes("type") ||
    code.includes("const")
  ) {
    return "typescript";
  }
  if (code.includes("function") || code.includes("=>")) {
    return "javascript";
  }
  return "typescript"; // default
};

// Memoized code formatter
const formatCode = (code: string): string => {
  try {
    // Basic formatting - you can enhance this with prettier or other formatters
    return code
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  } catch (error) {
    console.error("Error formatting code:", error);
    return code;
  }
};

export const CodeEditor: React.FC<CodeEditorProps> = React.memo(
  ({
    initialValue = "",
    language: propLanguage,
    onChange,
    readOnly = false,
    className = "",
    height = "300px",
    showLineNumbers = true,
  }) => {
    const [code, setCode] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);

    // Memoize detected language
    const detectedLanguage = useMemo(
      () => propLanguage || detectLanguage(code),
      [propLanguage, code]
    );

    // Debounced onChange handler
    const debouncedOnChange = useDebounce((value: string) => {
      onChange?.(value);
    }, 500);

    // Memoized formatted code
    const formattedCode = useMemo(() => formatCode(code), [code]);

    // Handle code changes
    const handleCodeChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setCode(newValue);
        debouncedOnChange(newValue);
      },
      [debouncedOnChange]
    );

    // Handle editor focus
    const handleFocus = useCallback(() => {
      setIsEditing(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsEditing(false);
    }, []);

    // Memoized editor styles
    const editorStyles = useMemo(
      () => ({
        height,
        fontFamily: "monospace",
        fontSize: "14px",
        lineHeight: "1.5",
        padding: "1rem",
        backgroundColor: "#ffffff",
        color: "#24292e",
        border: "1px solid #e1e4e8",
        borderRadius: "0.5rem",
        outline: "none",
        resize: "vertical" as const,
        width: "100%",
      }),
      [height]
    );

    return (
      <div className={`relative ${className}`}>
        {!isEditing && !readOnly && (
          <div className="absolute top-2 right-2 text-xs text-gray-400">
            Click to edit
          </div>
        )}

        {readOnly ? (
          <div className="relative bg-white rounded-lg overflow-hidden border border-gray-200">
            <SyntaxHighlighter
              language={detectedLanguage}
              style={oneLight}
              showLineNumbers={showLineNumbers}
              wrapLines
              customStyle={{
                margin: 0,
                padding: "1rem",
                background: "transparent",
                fontSize: "14px",
                fontFamily: "monospace",
              }}
            >
              {formattedCode}
            </SyntaxHighlighter>
          </div>
        ) : (
          <textarea
            value={code}
            onChange={handleCodeChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={editorStyles}
            spellCheck={false}
            className="focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
          />
        )}

        {!readOnly && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {detectedLanguage.toUpperCase()}
          </div>
        )}
      </div>
    );
  }
);

CodeEditor.displayName = "CodeEditor";
