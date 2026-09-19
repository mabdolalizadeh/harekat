import StudentReviewCard from "./StudentReviewCard.jsx";

export default function TestimonialCard({ quote, review, name, className, ...props }) {
    return (
        <StudentReviewCard
            review={review || quote}
            name={name}
            className={className}
            {...props}
        />
    );
}
