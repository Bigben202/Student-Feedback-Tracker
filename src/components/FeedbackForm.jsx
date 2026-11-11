import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function FeedbackForm({ onAdd }) {
  const [name, setName] = useState("")
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !comment.trim() || !rating.trim()) return

    onAdd({ name: name.trim(), comment: comment.trim(), rating })
    setName("")
    setComment("")
    setRating("")
     
    toast("Feedback Submitted Successfully")
  }

  return (
    <form className="space-y-4  mx-20 " onSubmit={handleSubmit}>
      <Input
        placeholder="Student Name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="bg-white border-green-400"
      />
      <Textarea
        placeholder="Comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        className="bg-white border-green-400"
      />
      <Input
        type="number"
        min="1"
        max="4"
        placeholder="Rating (1-4)..."
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        required
        className="bg-white border-green-400"
      />
      <Button type="submit" className="mb-4" >Add Feedback</Button>
    </form>
  )
}