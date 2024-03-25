import csv

def generate_unique_socID(input_file):
    unique_socIDs = {}  # Dictionary to store unique society IDs
    with open(input_file, 'r') as infile:
        reader = csv.reader(infile, delimiter='|')
        for row in reader:
            society_id = row[1]  # Assuming society ID is in the second column
            if society_id not in unique_socIDs:
                unique_socIDs[society_id] = len(unique_socIDs) + 1  # Generate unique society ID starting from 1
    return unique_socIDs

def create_new_psv(input_file, output_file, unique_socIDs):
    with open(input_file, 'r') as infile, open(output_file, 'w', newline='') as outfile:
        reader = csv.reader(infile, delimiter='|')
        writer = csv.writer(outfile, delimiter='|')

        # Write header for the new PSV file

        for row in reader:
            society_id = row[1]  # Assuming society ID is in the second column
            user_id = unique_socIDs[society_id]  # Get the corresponding unique user ID
            writer.writerow([user_id, society_id])

# Example usage:
input_filename = 'ElectionTestData/member_soc.psv'
output_filename = 'user_soc.psv'

# Generate unique society IDs
unique_socIDs = generate_unique_socID(input_filename)

# Create the new PSV file with attributes userID and societyID
create_new_psv(input_filename, output_filename, unique_socIDs)
print("New PSV file created:", output_filename)
