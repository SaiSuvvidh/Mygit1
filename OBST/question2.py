def optimal_bst(keys, freq):
    n = len(keys)
    cost = [[0 for _ in range(n)] for _ in range(n)]

    for i in range(n):
        cost[i][i] = freq[i]

    for L in range(2, n + 1):  # L is chain length
        for i in range(n - L + 1):
            j = i + L - 1
            cost[i][j] = float('inf')

            total_freq = sum(freq[i:j + 1])

            for r in range(i, j + 1):
                c = (cost[i][r - 1] if r > i else 0) + \
                    (cost[r + 1][j] if r < j else 0) + total_freq
                if c < cost[i][j]:
                    cost[i][j] = c

    return cost[0][n - 1]


# Step 1: Sort keys alphabetically
words = ["she", "for", "I", "he", "of"]
probs = [0.28, 0.29, 0.33, 0.32, 0.19]

# Zip and sort
sorted_data = sorted(zip(words, probs), key=lambda x: x[0])
sorted_keys = [item[0] for item in sorted_data]
sorted_probs = [item[1] for item in sorted_data]

# Compute OBST cost
min_cost = optimal_bst(sorted_keys, sorted_probs)

print("Optimal cost of the binary search tree:", round(min_cost, 4))
