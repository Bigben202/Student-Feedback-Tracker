import { useState } from 'react'
import FeedbackForm from "@/components/FeedbackForm";
import FeedbackList from "@/components/FeedbackList";
import { Toaster } from "@/components/ui/sonner"

export default function App () {
  const [feedbacks, setFeedbacks] = useState([]);

  const addFeedback = (feedback) =>{
    setFeedbacks(prev => [feedback, ...prev]);
  }

  const deleteFeedback = (index) => {
    setFeedbacks(prev => prev.filter((_ , i) => i !== index ))
  }

  return (
    <div className=' min-h-screen bg-gray-400 '>
      <h1 className='text-3xl font-bold text-center' > Student Feedback Tracker </h1>
      <FeedbackForm onAdd={addFeedback} />
      <FeedbackList feedbacks={feedbacks} onDelete={deleteFeedback} />
      <Toaster />
    </div>
  )
}
