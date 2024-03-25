# def add_unique_id(input_file, output_file):
#     unique_id = 21000
#     with open(input_file, 'r') as infile, open(output_file, 'w') as outfile:
#         for line in infile:
#             # Strip newline character and add unique ID at the beginning of the line
#             line = line.strip()
#             outfile.write(f"{unique_id}|{line}\n")
#             unique_id += 1

# # Example usage:
# input_filename = 'ElectionTestData/employee_soc.psv'
# output_filename = 'employee_soc_with_unique_id.psv'
# add_unique_id(input_filename, output_filename)
# print("Unique IDs added. Updated data saved in", output_filename)
