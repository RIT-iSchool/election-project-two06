import utils

#Unit test 1
def test_password_no_number():
    result = utils.isValidPassword("NoNumber!")
    print_result("test_password_no_number", result)

def test_password_no_special_char():
    result = utils.isValidPassword("NoSpecialChar!")
    print_result("test_password_no_special_char", result)

def test_password_no_lowercase():
    result = utils.isValidPassword("NOLOWERCASE!")
    print_result("test_password_no_lowercase", result)

def test_password_no_uppercase():
    result = utils.isValidPassword("nouppercase!")
    print_result("test_password_no_uppercase", result)

def test_password_short():
    result = utils.isValidPassword("Short1!")
    print_result("test_password_short", result)

def test_valid_password():
    result = utils.isValidPassword("GoodP4ssw0rd!")
    print_result("test_valid_password", result)

def test_user_input_password():
    # Simulate user input for password
    predefined_password = "TestPassword123!"  # Change this to your desired test password
    result = utils.isValidPassword(predefined_password)

    # Print the predefined password and the result of validation
    print(f"Predefined password: {predefined_password}")
    print(f"Is valid: {result}")

    print_result("test_user_input_password", result)

def print_result(test_name, result):
    if result:
        print(f"{test_name}: Passed")
    else:
        print(f"{test_name}: Failed")





# #Unit test 2
def test_valid_gmail():
    result = utils.isValidEmail("example@gmail.com")
    print_result("test_valid_gmail", result)

def test_valid_rit_email():
    result = utils.isValidEmail("john.doe@rit.edu")
    print_result("test_valid_rit_email", result)

def test_invalid_email_special_chars():
    result = utils.isValidEmail("invalid!email@gmail.com")
    print_result("test_invalid_email_special_chars", not result)

def test_invalid_email_no_domain():
    result = utils.isValidEmail("missing@domain")
    print_result("test_invalid_email_no_domain", not result)

def test_user_input_email():
    # Simulate user input for email
    predefined_email = "test.user@gmail.com"  # Change this to your desired test email
    result = utils.isValidEmail(predefined_email)

    # Print the predefined email and the result of validation
    print(f"Predefined email: {predefined_email}")
    print(f"Is valid: {result}")

    print_result("test_user_input_email", result)

def print_result(test_name, result):
    if result:
        print(f"{test_name}: Passed")
    else:
        print(f"{test_name}: Failed")








# #Unit test 3
def prompt_for_mandatory_field(field_name):
    while True:
        value = input(f"Please enter your {field_name} (mandatory): ").strip()
        if value:
            return value
        else:
            print(f"{field_name} is a mandatory field. Please enter a valid {field_name}.")







# #Unit 4
def test_ballot_initiative():
    long_text = "a" * 100  # Creating a ballot initiative longer than 500 characters
    result_long_text = not utils.isBallotInitiativeWithinRange(long_text)

    print_result("test_ballot_initiative", result_long_text)

def test_user_input_ballot_initiative():
    # Simulate user input for ballot initiative
    predefined_initiative = "This is a very long initiative that exceeds 500 characters."  # Change this to your desired test initiative
    result = not utils.isBallotInitiativeWithinRange(predefined_initiative)

    # Print the result of validation

def print_result(test_name, result):
    if result:
        print(f"{test_name}: Failed")
    else:
        print(f"{test_name}: Passed")








#Unit Test 5
def test_upload_jpeg_success():
    assert utils.is_valid_photo_format("photo.jpeg"), "JPEG format should be allowed"
    print("test_upload_jpeg_success: Passed")

def test_upload_png_success():
    assert utils.is_valid_photo_format("image.png"), "PNG format should be allowed"
    print("test_upload_png_success: Passed")

def test_upload_jpg_success():
    """
    Test that uploading a JPG file is successful.
    """
    assert utils.is_valid_photo_format("picture.jpg"), "JPG format should be allowed"
    print("test_upload_jpg_success: Passed")

def test_upload_invalid_format():
    invalid_formats = ["photo.bmp", "picture.tiff", "document.pdf", "archive.zip"]
    for file_name in invalid_formats:
        assert not utils.is_valid_photo_format(file_name), f"File with extension {file_name.split('.')[-1]} should not be allowed"
        print(f"test_upload_invalid_format ({file_name}): Passed")







if __name__ == "__main__":
    # Run all the tests
    test_password_no_number()
    test_password_no_special_char()
    test_password_no_lowercase()
    test_password_no_uppercase()
    test_password_short()
    test_valid_password()

    # Test the predefined password for user input
    test_user_input_password()

    # Run all the email validity tests
    test_valid_gmail()
    test_valid_rit_email()
    test_invalid_email_special_chars()
    test_invalid_email_no_domain()

    # Test the predefined email for user input
    test_user_input_email()

    fname = prompt_for_mandatory_field("First Name")
    lname = prompt_for_mandatory_field("Last Name")

    print(f" First Name: {fname}, Last Name: {lname}")

    # Run all the ballot initiative tests
    test_ballot_initiative()

    # Test the predefined ballot initiative for user input
    test_user_input_ballot_initiative()

    test_upload_jpeg_success()
    test_upload_png_success()
    test_upload_jpg_success()
    test_upload_invalid_format()


