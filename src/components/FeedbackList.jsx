import FeedbackItem from "@/components/FeedbackItem";

export default function FeedbackList({feedbacks, onDelete}){
    if (feedbacks.length === 0){
        return <p className="mx-80">No Feedback Submitted Yet</p>
    }

    return(
        <div className="space-y-4 mx-20">
            {feedbacks.map((f, i) => (
                <FeedbackItem
                    key= {i}
                    index= {i}
                    feedback= {f}
                    onDelete={onDelete} 
                /> 
            ))}

        </div>
    )

}