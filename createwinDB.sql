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
    C_Bio text
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

COPY Users FROM 'C:/Users/Shikha Hemanth/OneDrive/Desktop/iste  432/election-project-two06/ElectionTestData/users.psv' DELIMITER '|' CSV HEADER;
COPY Professional_Society FROM 'C:/Users/Shikha Hemanth/OneDrive/Desktop/iste  432/election-project-two06/ElectionTestData/societies.psv' DELIMITER '|' CSV HEADER;
COPY User_Society FROM 'C:/Users/Shikha Hemanth/OneDrive/Desktop/iste  432/election-project-two06/ElectionTestData/user_soc.psv' DELIMITER '|' CSV HEADER;
COPY Ballot_Initiative FROM 'C:/Users/Shikha Hemanth/OneDrive/Desktop/iste  432/election-project-two06/ElectionTestData/ballot_initiatives.psv' DELIMITER '|' CSV HEADER;
COPY Ballot FROM 'C:/Users/Shikha Hemanth/OneDrive/Desktop/iste  432/election-project-two06/ElectionTestData/elections.psv' DELIMITER '|' CSV HEADER;
COPY Office FROM 'C:/Users/Shikha Hemanth/OneDrive/Desktop/iste  432/election-project-two06/ElectionTestData/office.psv' DELIMITER '|' CSV HEADER;
COPY Candidate FROM 'C:/Users/Shikha Hemanth/OneDrive/Desktop/iste  432/election-project-two06/ElectionTestData/candidates.psv' DELIMITER '|' CSV HEADER;
COPY Vote FROM 'C:/Users/Shikha Hemanth/OneDrive/Desktop/iste  432/election-project-two06/ElectionTestData/votes.psv' DELIMITER '|' CSV HEADER;
COPY Ballot_Initiative_Vote FROM 'C:/Users/Shikha Hemanth/OneDrive/Desktop/iste  432/election-project-two06/ElectionTestData/ballot_init_votes.psv' DELIMITER '|' CSV HEADER;
COPY Write_Ins FROM 'C:/Users/Shikha Hemanth/OneDrive/Desktop/iste  432/election-project-two06/ElectionTestData/write_ins.psv' DELIMITER '|' CSV HEADER;