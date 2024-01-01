import SkeletonCard from "@/components/ui/skeletonCard";

function Loading() {
  return (
    <main>
      <div className="grid grid-cols-3 gap-8">
        {"123456789".split("").map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </main>
  );
}

export default Loading;
