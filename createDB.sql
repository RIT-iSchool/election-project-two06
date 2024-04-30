DROP TABLE IF EXISTS User_Society;
DROP TABLE IF EXISTS Write_Ins;
DROP TABLE IF EXISTS Ballot_Initiative_Vote;
DROP TABLE IF EXISTS Vote;
DROP TABLE IF EXISTS Ballot_Initiative;
DROP TABLE IF EXISTS Candidate;
DROP TABLE IF EXISTS Office;
DROP TABLE IF EXISTS Ballot;
DROP TABLE IF EXISTS Professional_Society;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    UserID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    FName text NOT NULL,
    LName text NOT NULL,
    Email text NOT NULL,
    UserType text NOT NULL,
    Password text NOT NULL,
    is_pwd_encrypted boolean DEFAULT false
);

CREATE TABLE Professional_Society (
    SocietyID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    SocietyName text NOT NULL,
    Abbreviation text,
    Discipline text
);

CREATE TABLE User_Society (
    UniqueSocietyID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    UserID int REFERENCES Users(UserID) NOT NULL,
    SocietyID int REFERENCES Professional_Society(SocietyID) NOT NULL
);

CREATE TABLE Ballot_Initiative (
    BallotInitID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    SocietyID int REFERENCES Professional_Society(SocietyID) NOT NULL,
    Description text,
    CreationDate date
);

CREATE TABLE Ballot (
    BallotID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    BallotTitle text,
    SocietyID int REFERENCES Professional_Society(SocietyID) NOT NULL,
    Startdate timestamp NOT NULL,
    EndDate timestamp NOT NULL
);

CREATE TABLE Office (
    OfficeID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    BallotID int REFERENCES Ballot(BallotID) NOT NULL,
    OfficeName text NOT NULL,
    Choices int
);

CREATE TABLE Candidate (
    CandidateID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    OfficeID int REFERENCES Office(OfficeID),
    BallotID int REFERENCES Ballot(BallotID),
    AllowedVotes int,
    CFName text NOT NULL,
    CLName text NOT NULL,
    C_Credentials text,
    C_Bio text,
    Photo bytea
);

CREATE TABLE Vote (
    VoteID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    UserID int REFERENCES Users(UserID) NOT NULL,
    BallotID int REFERENCES Ballot(BallotID) NOT NULL,
    OfficeID int REFERENCES Office(OfficeID) NOT NULL,
    CandidateID int REFERENCES Candidate(CandidateID),
    Timestamp timestamp NOT NULL
);

CREATE TABLE Ballot_Initiative_Vote (
    VoteInitID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    BallotInitID int REFERENCES Ballot_Initiative(BallotInitID) NOT NULL,
    UserID int REFERENCES Users(UserID) NOT NULL,
    Timestamp timestamp NOT NULL,
    Choice boolean,
    Response text
);

CREATE TABLE Write_Ins (
    WriteID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    UserID int REFERENCES Users(UserID) NOT NULL,
    CFName text NOT NULL,
    CLName text NOT NULL,
    OfficeID int REFERENCES Office(OfficeID) NOT NULL
);

CREATE OR REPLACE FUNCTION encrypt_users_password()
RETURNS TRIGGER AS $$
BEGIN
    -- Call the encryption script
    PERFORM pg_notify('encrypt_users_password', 'encrypt');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_encrypt_users_password
AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION encrypt_users_password();

COPY Users FROM '/tmp/users.psv' DELIMITER '|' CSV HEADER;
COPY Professional_Society FROM '/tmp/societies.psv' DELIMITER '|' CSV HEADER;
COPY User_Society FROM '/tmp/user_soc.psv' DELIMITER '|' CSV HEADER;
COPY Ballot_Initiative FROM '/tmp/ballot_initiatives.psv' DELIMITER '|' CSV HEADER;
COPY Ballot FROM '/tmp/elections.psv' DELIMITER '|' CSV HEADER;
COPY Office FROM '/tmp/office.psv' DELIMITER '|' CSV HEADER;
COPY Candidate FROM '/tmp/candidates.psv' DELIMITER '|' CSV HEADER;
COPY Vote FROM '/tmp/votes.psv' DELIMITER '|' CSV HEADER;
COPY Ballot_Initiative_Vote FROM '/tmp/ballot_init_votes.psv' DELIMITER '|' CSV HEADER;
COPY Write_Ins FROM '/tmp/write_ins.psv' DELIMITER '|' CSV HEADER;