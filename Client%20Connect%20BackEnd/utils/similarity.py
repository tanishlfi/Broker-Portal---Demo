from difflib import SequenceMatcher, ndiff


# Utility function to compute similarity
def compute_similararity_ratio(str1, str2):
    return SequenceMatcher(None, str1, str2).ratio()


# This code calculates the similarity between two strings using the ndiff method from the difflib library.
def compute_similarity_ndiff(input_string, reference_string):
    # The ndiff method returns a list of strings representing the differences between the two input strings.
    diff = ndiff(input_string, reference_string)
    diff_count = 0
    for line in diff:
        # a "-", indicating that it is a deleted character from the input string.
        if line.startswith("-"):
            diff_count += 1
    # calculates the similarity by subtracting the ratio of the number of deleted characters to the length of the input string from 1
    return 1 - (diff_count / len(input_string))


# calculates the minimum number of edits (insertions, deletions, or substitutions) required to transform one string into the other
def levenshtein_distance(s, t):
    m, n = len(s), len(t)
    if m < n:
        s, t = t, s
        m, n = n, m
    d = [list(range(n + 1))] + [[i] + [0] * n for i in range(1, m + 1)]
    for j in range(1, n + 1):
        for i in range(1, m + 1):
            if s[i - 1] == t[j - 1]:
                d[i][j] = d[i - 1][j - 1]
            else:
                d[i][j] = min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]) + 1
    return d[m][n]


# check above algorithm
def compute_similarity_levenshtein_distance(input_string, reference_string):
    distance = levenshtein_distance(input_string, reference_string)
    max_length = max(len(input_string), len(reference_string))
    similarity = 1 - (distance / max_length)
    return similarity


# percentage match in exact words in the string, depending on the number of words in the input string
# NB this is not a good measure of similarity and should only  be used in specific conditions such as check if a name is included for someone who has multiple names
def compute_similarity_percentage_match(input_string, reference_string):
    # if input string length is  0
    if len(input_string) == 0:
        return 0

    if len(reference_string) == 0:
        return 0

    # exact match
    if input_string.lower() == reference_string.lower():
        return 1

    # check number of matching words
    uniqueInputString = set(input_string.lower().split())
    uniqueReferenceString = set(reference_string.lower().split())
    matchCount = 0

    for word in uniqueReferenceString:
        if word in uniqueInputString:
            matchCount += 1

    return matchCount / len(uniqueInputString)


# check all the algorithms
def allScores(input_string, reference_string):
    try:
        return {
            "ratio": compute_similararity_ratio(input_string, reference_string),
            "ndiff": compute_similarity_ndiff(input_string, reference_string),
            "levenshtein": compute_similarity_levenshtein_distance(
                input_string, reference_string
            ),
            "percentage": compute_similarity_percentage_match(
                input_string, reference_string
            ),
        }
    except Exception as e:
        print(f"error in calc{e}")
        # exit()
    return {
        "ratio": 0,
        "ndiff": 0,
        "levenshtein": 0,
        "percentage": 0,
    }


if __name__ == "__main__":
    # Initializing strings
    test_string1 = "Lourens Jacobus"
    test_string2 = "Lourens Lourens"

    # Printing ratios
    import pprint

    pprint.pprint(allScores(test_string1, test_string2))
