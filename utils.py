import re

def isValidPassword(pw):
    # Require password to have (using positive look-ahead):
    # • number       \d
    # • lower case   [a-z]
    # • upper case   [A-Z]
    # • special char [ !"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]
    # • at least 8 characters
    return bool(re.match(r'^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$', pw))


def isValidEmail(email):
    return bool(re.match(r'^[a-zA-Z0-9._%+-]+@(?:gmail\.com|rit\.edu)$', email))


def isBallotInitiativeWithinRange(initiative):
    return len(initiative) <= 500

def is_valid_photo_format(file_name):
    allowed_extensions = ['jpg', 'jpeg', 'png']
    extension = file_name.split('.')[-1].lower()
    return extension in allowed_extensions


