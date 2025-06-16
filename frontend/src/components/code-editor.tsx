"use client";

import { useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

interface CodeEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  className?: string;
  readOnly?: boolean;
}

export const CodeEditor = ({
  initialValue,
  onChange,
  language = "typescript",
  height = "100%",
  className = "",
  readOnly = false,
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== initialValue) {
        editorRef.current.setValue(initialValue);
      }
    }
  }, [initialValue]);

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <Editor
      height={height}
      defaultLanguage={"typescript"}
      defaultValue={initialValue}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        theme: "vs-light",
        scrollbar: {
          vertical: "visible",
          horizontal: "visible",
        },
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        glyphMargin: false,

        renderLineHighlight: "all",
        selectOnLineNumbers: true,
        // Enhanced suggestions for React/JSX
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true,
        },
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: "on",
        // Auto-closing brackets and quotes for JSX
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        autoClosingOvertype: "always",
        // Better indentation for JSX
        autoIndent: "full",
        formatOnPaste: true,
        formatOnType: true,
      }}
      className={className}
    />
  );
};
