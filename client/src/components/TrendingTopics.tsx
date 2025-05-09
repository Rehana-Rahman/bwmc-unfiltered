import { useLocation } from "wouter";
import { Topic } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash } from "lucide-react";

interface TrendingTopicsProps {
  topics: Topic[];
  compact?: boolean;
}

export default function TrendingTopics({ topics, compact = false }: TrendingTopicsProps) {
  const [, setLocation] = useLocation();

  if (topics.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-muted-foreground text-sm">No trending topics available</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {topics.map((topic) => (
          <div key={topic.id}>
            <p 
              className="text-accent font-medium text-sm hover:underline cursor-pointer"
              onClick={() => setLocation(`/trending?topic=${topic.name}`)}
            >
              #{topic.name}
            </p>
            <p className="text-xs text-muted-foreground">{topic.postCount} posts</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {topics.map((topic) => (
        <Button
          key={topic.id}
          variant="outline"
          className="flex-shrink-0 h-auto py-3 px-4 rounded-lg"
          onClick={() => setLocation(`/trending?topic=${topic.name}`)}
        >
          <div className="flex flex-col items-center space-y-1">
            <div className="flex items-center space-x-1">
              <Hash className="h-4 w-4 text-accent" />
              <span className="font-semibold">{topic.name}</span>
            </div>
            <Badge variant="secondary" className="font-normal">
              {topic.postCount} posts
            </Badge>
          </div>
        </Button>
      ))}
    </div>
  );
}
