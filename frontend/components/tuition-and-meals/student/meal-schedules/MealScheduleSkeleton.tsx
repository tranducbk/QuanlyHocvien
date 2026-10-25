import Skeleton from "@/library/Skeleton";
import styles from "./MealScheduleSkeleton.module.css";

export default function MealScheduleSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={styles.summaryCard}
          >
            <Skeleton variant="text" width={90} height={14} />
            <Skeleton variant="text" width={140} height={24} />
          </div>
        ))}
      </div>

      <div className={styles.schedule}>
        <div className={styles.scheduleHeading}>
          <Skeleton variant="text" width={140} height={22} />
          <Skeleton variant="text" width={260} height={14} />
        </div>
        <div className={styles.table}>
          <div className={styles.row}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="text" width={90} height={16} />
            ))}
          </div>
          {Array.from({ length: 7 }).map((_, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              <Skeleton variant="text" width={64} height={16} />
              {Array.from({ length: 3 }).map((_, mealIndex) => (
                <Skeleton
                  key={mealIndex}
                  variant="rounded"
                  width={112}
                  height={40}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
