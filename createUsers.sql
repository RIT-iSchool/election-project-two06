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
    Password text NOT NULL
);

CREATE TABLE Professional_Society (
    SocietyID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    SocietyName text NOT NULL,
    Abbreviation text,
    Discipline text
);

CREATE TABLE User_Society (
    UniqueSocietyID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    SocietyID int REFERENCES Professional_Society(SocietyID) NOT NULL,
    UserID int REFERENCES Users(UserID) NOT NULL
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
    C_Credentials text NOT NULL,
    C_Bio text NOT NULL
);

CREATE TABLE Vote (
    VoteID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    UserID int REFERENCES Users(UserID) NOT NULL,
    BallotID int REFERENCES Ballot(BallotID) NOT NULL,
    OfficeID int REFERENCES Office(OfficeID) NOT NULL,
    CandidateID int REFERENCES Candidate(CandidateID) NOT NULL,
    Timestamp timestamp NOT NULL
);

CREATE TABLE Ballot_Initiative_Vote (
    VoteInitID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    UserID int REFERENCES Users(UserID) NOT NULL,
    Timestamp timestamp NOT NULL,
    BallotInitID int REFERENCES Ballot_Initiative(BallotInitID) NOT NULL,
    Choice boolean NOT NULL,
    Response text
);

CREATE TABLE Write_Ins (
    WriteID int PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY,
    UserID int REFERENCES Users(UserID) NOT NULL,
    CFName text NOT NULL,
    CLName text NOT NULL,
    OfficeID int REFERENCES Office(OfficeID) NOT NULL
);

COPY Professional_Society FROM '/tmp/societies.psv' DELIMITER '|' CSV HEADER;