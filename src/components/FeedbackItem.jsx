import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function FeedbackItem({ feedback, index, onDelete }) {
  return (
    <Card className="flex-row items-center justify-between p-4">
      <div>
        <h2 className="font-semibold">{feedback.name}</h2>
        <p className="text-sm text-muted-foreground">{feedback.comment}</p>
        <p className="mt-1 text-sm font-medium">Rating: {feedback.rating}</p>
      </div>
      <Button
        type="button"
        variant="destructive"
        onClick={() => onDelete(index)}
      >
        Delete
      </Button>
    </Card>
  )
}