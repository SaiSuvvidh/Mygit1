def job_sequencing_with_deadline(profits, deadlines):
    n = len(profits)
    jobs = list(zip(range(1, n + 1), profits, deadlines))  # (Job ID, Profit, Deadline)
    jobs.sort(key=lambda x: x[1], reverse=True)  # Sort by profit descending

    max_deadline = max(deadlines)
    slots = [None] * max_deadline  # Timeslots initialized to None

    total_profit = 0
    job_order = []

    for job_id, profit, deadline in jobs:
        # Try to schedule job in latest possible slot before its deadline
        for slot in range(min(deadline, max_deadline) - 1, -1, -1):
            if slots[slot] is None:
                slots[slot] = f"P{job_id}"
                total_profit += profit
                job_order.append((f"P{job_id}", profit, slot + 1))
                break

    return job_order, total_profit


# Given data
profits = [3, 5, 20, 18, 1, 6, 30]
deadlines = [1, 3, 4, 3, 2, 1, 2]

# Run the algorithm
job_order, total_profit = job_sequencing_with_deadline(profits, deadlines)

# Output
print("Scheduled Jobs (Job ID, Profit, Time Slot):")
for job in job_order:
    print(job)

print("\nTotal Profit:", total_profit)
