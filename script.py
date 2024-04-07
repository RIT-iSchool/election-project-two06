import csv
import random

def modify_user_id(input_file, output_file):
    with open(input_file, 'r') as f:
        reader = csv.DictReader(f, delimiter='|')
        data = list(reader)

    for row in data:
        row['BallotInit ID'] = str(random.randint(1, 10))

    with open(output_file, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=reader.fieldnames, delimiter='|')
        writer.writeheader()
        writer.writerows(data)

if __name__ == "__main__":
    input_file = "ElectionTestData/ballot_init_votes.psv"
    output_file = "ElectionTestData/ballot_init_votes.psv"
    modify_user_id(input_file, output_file)
    print("User IDs modified successfully and saved to", output_file)

# def increment_user_ids(file_path):
#     with open(file_path, 'r') as file:
#         lines = file.readlines()

#     updated_lines = []
#     user_id = 1

#     # Skip the first line (titles)
#     updated_lines.append(lines[0].strip())

#     for line in lines[1:]:
#         if line.strip():  # skip empty lines
#             parts = line.strip().split('|')
#             parts[0] = str(user_id)
#             updated_lines.append('|'.join(parts))
#             user_id += 1

#     with open(file_path, 'w') as file:
#         file.write('\n'.join(updated_lines))

# # Example usage
# file_path = 'ElectionTestData/elections.psv'
# increment_user_ids(file_path)
# print("User IDs incremented successfully!")
