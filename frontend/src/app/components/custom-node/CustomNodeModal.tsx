import { useState } from "react";
import { useParams } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CodeEditor } from "@/components/code-editor";
import {
  useCreateCustomNode,
  useUpdateCustomNode,
} from "@/hooks/useCustomNodes";
import type { NodeData } from "@/types";

interface CustomNodeModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<boolean>;
  code: string;
  setCode: (code: string) => void;
  onCreate: () => void;
  onUpdate: () => void;
  editingNodeId?: string;
}

export const CustomNodeModal = ({
  isOpen,
  setIsOpen,
  code,
  setCode,
  onCreate,
  onUpdate,
  editingNodeId,
}: CustomNodeModalProps) => {
  const { projectId } = useParams();
  const [nodeData, setNodeData] = useState<NodeData>({
    label: "",
    type: "custom",
    config: {
      inputs: {
        value: null,
        updatedAt: new Date(),
      },
      outputs: {
        value: null,
        updatedAt: new Date(),
      },
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      category: "custom",
      tags: [],
      description: "",
    },
  });

  const createMutation = useCreateCustomNode(projectId as string);
  const updateMutation = useUpdateCustomNode(
    projectId as string,
    editingNodeId as string
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: nodeData.label,
        description: nodeData.metadata?.description || "",
        code,
        metadata: {
          ...nodeData.metadata,
          category: nodeData.metadata?.category || "custom",
          tags: nodeData.metadata?.tags || [],
          icon: nodeData.metadata?.icon || "⚡",
        },
      };

      if (editingNodeId) {
        await updateMutation.mutateAsync(data);
        toast.success("Custom node updated successfully");
        onUpdate();
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Custom node created successfully");
        onCreate();
      }
    } catch (error) {
      toast.error("Failed to save custom node");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative w-3/4 h-3/4 bg-white rounded-lg p-4 shadow-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="w-full h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {editingNodeId ? "Edit Custom Node" : "Create Custom Node"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Create a custom node with your own logic and UI
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-gray-100 text-gray-500 rounded-full p-2 hover:bg-gray-200 transition-colors"
            >
              <X />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            {/* Left column - Node configuration */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={nodeData.label}
                  onChange={(e) =>
                    setNodeData({ ...nodeData, label: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  placeholder="My Custom Node"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={nodeData.metadata?.description}
                  onChange={(e) =>
                    setNodeData({
                      ...nodeData,
                      metadata: {
                        ...nodeData.metadata,
                        description: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  rows={3}
                  placeholder="What does this node do?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={nodeData.metadata?.category}
                  onChange={(e) =>
                    setNodeData({
                      ...nodeData,
                      metadata: {
                        ...nodeData.metadata,
                        category: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="web3">Web3</option>
                  <option value="inputs">Inputs</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={nodeData.metadata?.tags?.join(", ")}
                  onChange={(e) =>
                    setNodeData({
                      ...nodeData,
                      metadata: {
                        ...nodeData.metadata,
                        tags: e.target.value.split(",").map((t) => t.trim()),
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  placeholder="ethereum, transaction, custom"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={nodeData.metadata?.isPublic}
                  onChange={(e) =>
                    setNodeData({
                      ...nodeData,
                      metadata: {
                        ...nodeData.metadata,
                        isPublic: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label
                  htmlFor="isPublic"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Make this node public (available to other projects)
                </label>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-orange-800">Tips</h3>
                <ul className="mt-2 text-sm text-orange-700 list-disc list-inside space-y-1">
                  <li>Use the template code as a starting point</li>
                  <li>Add inputs and outputs in the node configuration</li>
                  <li>Customize the appearance with metadata</li>
                  <li>Test your node before making it public</li>
                </ul>
              </div>
            </div>

            {/* Right column - Code editor */}
            <div className="flex-1 min-h-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Node Component Code
              </label>
              <div className="h-full bg-white rounded-lg border border-gray-200">
                <CodeEditor
                  initialValue={code}
                  onChange={setCode}
                  language="typescript"
                  height="100%"
                  className="h-full"
                  readOnly={false}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editingNodeId ? "Updating..." : "Creating..."}
                </div>
              ) : editingNodeId ? (
                "Update Node"
              ) : (
                "Create Node"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
