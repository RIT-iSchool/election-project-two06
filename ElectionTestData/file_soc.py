import csv

def update_employee_id(input_file, output_file):
    with open(input_file, 'r') as infile, open(output_file, 'w', newline='') as outfile:
        reader = csv.reader(infile, delimiter='|')
        writer = csv.writer(outfile, delimiter='|')
        
        employee_id = 21500  # Starting employee ID
        
        for row in reader:
            if row:  # Check if the row is not empty
                row[0] = str(employee_id)  # Update Employee ID
                writer.writerow(row)
                employee_id += 1  # Increment Employee ID

# Example usage:
input_filename = 'ElectionTestData/admin_final.psv'
output_filename = 'employee.psv'
update_employee_id(input_filename, output_filename)
print("Admin IDs updated. Updated data saved in", output_filename)
