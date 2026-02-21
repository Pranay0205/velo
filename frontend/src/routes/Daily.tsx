import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function Daily() {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Today's Focus</h1>
          <p className="text-zinc-400 text-sm">Execute on your priorities for today.</p>
        </div>
        <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold">
          New Task
        </Button>
      </header>

      <div className="grid gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium text-white">Daily Standup</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">Morning sync with the team</CardDescription>
            </div>
            <Checkbox className="border-cyan-500 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-black" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-[10px] px-2 py-0">
                WORK
              </Badge>
              <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px] px-2 py-0">
                FOCUS
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for Task list */}
        <div className="p-8 border border-dashed border-zinc-900 rounded-xl flex flex-col items-center justify-center text-zinc-600 bg-zinc-950/50">
          <p className="text-sm">More tasks will appear here.</p>
        </div>
      </div>
    </div>
  );
}
