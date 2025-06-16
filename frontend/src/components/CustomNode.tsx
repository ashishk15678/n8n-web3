import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card, CardContent } from "@/components/ui/card"

interface CustomNodeData {
  label: string
  description: string
  status: "idle" | "processing" | "done"
}

export const CustomNode = memo(({ data }: NodeProps<CustomNodeData>) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "done":
        return "bg-gray-900 text-white border-gray-900 shadow-lg scale-110"
      case "processing":
        return "bg-gray-600 text-white border-gray-600 shadow-md animate-pulse scale-105"
      default:
        return "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md"
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500 animate-ping"
      case "processing":
        return "bg-blue-500 animate-pulse"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <Card
      className={`min-w-[200px] transition-all duration-500 hover:scale-105 cursor-pointer rounded-xl ${getStatusStyles(data.status)}`}
      style={{
        transform: `rotate(${Math.random() * 2 - 1}deg)`,
      }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400 border-2 border-white" />

      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${getStatusDot(data.status)}`} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold mb-1 truncate">{data.label}</h3>
            <p className="text-xs opacity-80 leading-tight">{data.description}</p>
          </div>
        </div>

        {data.status === "processing" && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div className="h-full bg-gray-600 rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        )}
      </CardContent>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-400 border-2 border-white" />
    </Card>
  )
})

CustomNode.displayName = "CustomNode"
