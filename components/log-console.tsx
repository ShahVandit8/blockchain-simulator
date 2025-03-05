"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronUp, Maximize2, Minimize2 } from "lucide-react"

export function LogConsole({ logs }:{ logs: { message: string; timestamp: Date; }[] }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  // Ref for the logs container
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest log
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight
    }
  }, [logs]) // Runs when logs update

  return (
    <motion.div
      className={`fixed bottom-0 left-0 right-0 z-50 ${isMaximized ? "top-0" : ""}`}
      animate={{
        height: isCollapsed ? "3.8rem" : isMaximized ? "100vh" : "12rem",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="h-full border-t rounded-none">
        <div className="flex items-center justify-between p-2 border-b bg-muted/50">
          <h3 className="font-medium">Console</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" disabled={isCollapsed} onClick={() => setIsMaximized(!isMaximized)}>
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" disabled={isMaximized} onClick={() => setIsCollapsed(!isCollapsed)}>
              <ChevronUp className={`h-4 w-4 transform transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
            </Button>
          </div>
        </div>
          <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-auto px-2 pt-2 pb-16 font-mono text-sm"
              ref={logsEndRef} // Attach ref to this container
            >
              {logs.map((log, index) => (
                <div key={index} className="text-muted-foreground">
                  [{log.timestamp.toLocaleTimeString()}] {log.message}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
