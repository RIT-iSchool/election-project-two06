import csv
import random

def modify_user_id(input_file, output_file):
    with open(input_file, 'r') as f:
        reader = csv.DictReader(f, delimiter='|')
        data = list(reader)

    for row in data:
        row['User ID'] = str(random.randint(1, 40))

    with open(output_file, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=reader.fieldnames, delimiter='|')
        writer.writeheader()
        writer.writerows(data)

if __name__ == "__main__":
    input_file = input("Enter input PSV file path: ")
    output_file = input("Enter output PSV file path: ")
    modify_user_id(input_file, output_file)
    print("User IDs modified successfully and saved to", output_file)
