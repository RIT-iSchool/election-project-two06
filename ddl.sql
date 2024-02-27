CREATE DATABASE Voting_System;
USE VotingSystem;

CREATE TABLE Users (
    UserID int PRIMARY KEY NOT NULL,
    FName varchar(255) NOT NULL,
    LName varchar(255) NOT NULL,
    Email varchar(255) NOT NULL,
    UserType varchar(255) NOT NULL,
    Password varchar(255) NOT NULL
);

CREATE TABLE Professional_Society (
    SocietyID int PRIMARY KEY NOT NULL,
    SocietyName varchar(255) NOT NULL,
    Description varchar(255),
    EmployeeID int FOREIGN KEY REFERENCES Users(UserID)
);

CREATE TABLE User_Society (
    UniqueSocietyID int PRIMARY KEY NOT NULL,
    SocietyID int FOREIGN KEY REFERENCES ProfessionalSociety(SocietyID) NOT NULL,
    UserID int FOREIGN KEY REFERENCES Users(UserID) NOT NULL
);

CREATE TABLE Candidate (
    CandidateID int PRIMARY KEY NOT NULL,
    CFName varchar(255) NOT NULL,
    CLName varchar(255) NOT NULL,
    SocietyID int FOREIGN KEY REFERENCES ProfessionalSociety(SocietyID),
    PortraitURL varchar(255),
    University varchar(255),
    Bio varchar(255),
    OfficeID int,
    Position varchar(255) NOT NULL
);

CREATE TABLE Ballot_Initiative (
    BallotInitID int PRIMARY KEY NOT NULL,
    SocietyID int FOREIGN KEY REFERENCES ProfessionalSociety(SocietyID) NOT NULL,
    Description varchar(255),
    CreationDate date
);

CREATE TABLE Ballot (
    BallotID int PRIMARY KEY NOT NULL,
    SocietyID int FOREIGN KEY REFERENCES ProfessionalSociety(SocietyID) NOT NULL,
    Startdate datetime NOT NULL,
    EndDate datetime NOT NULL
);

CREATE TABLE Office (
    OfficeID int PRIMARY KEY NOT NULL,
    BallotID int FOREIGN KEY REFERENCES Ballot(BallotID) NOT NULL,
    Position varchar(255) NOT NULL,
    Choices int
);

CREATE TABLE Vote (
    VoteID int PRIMARY KEY NOT NULL,
    UserID int FOREIGN KEY REFERENCES Users(UserID) NOT NULL,
    CandidateID int FOREIGN KEY REFERENCES Candidate(CandidateID) NOT NULL,
    Timestamp datetime NOT NULL
);

CREATE TABLE Ballot_Initiative_Vote (
    VoteInitID int PRIMARY KEY NOT NULL,
    UserID int FOREIGN KEY REFERENCES Users(UserID) NOT NULL,
    Timestamp datetime NOT NULL,
    BallotInitID int FOREIGN KEY REFERENCES BallotInitiative(BallotInitID) NOT NULL,
    Choice boolean NOT NULL,
    Response varchar(255)
);

CREATE TABLE Write_Ins (
    WriteID int PRIMARY KEY NOT NULL,
    UserID int FOREIGN KEY REFERENCES Users(UserID) NOT NULL,
    CFName varchar(255) NOT NULL,
    CLName varchar(255) NOT NULL,
    OfficeID int FOREIGN KEY REFERENCES Office(OfficeID) NOT NULL
);
