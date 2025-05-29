create database chatbot;

use chatbot;

create table games (
game_id serial primary key,
home_team varchar(255),
away_team varchar(255),
home_score int,
away_score int,
game_date timestamp,
status varchar(50)
);

create table teams (
team_id serial primary key,
name varchar(255),
league varchar(255),
wins int,
losses int,
draws int
);

create table players (
player_id serial primary key,
name varchar (255),
team_id int references teams(team_id),
position varchar (50),
goals int,
assists int,
yellow_cards int,
red_cards int
);

create table statistics (
stat_id serial primary key,
game_id int references games(game_id),
player_id int references players(player_id),
goals int,
assists int,
minutes_played int
);

CREATE TABLE IF NOT EXISTS queries (
  query_id INT AUTO_INCREMENT PRIMARY KEY,
  user_query TEXT,
  response TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  UNIQUE(email)
);



INSERT INTO games (home_team, away_team, home_score, away_score, game_date, status)
VALUES ('Team A', 'Team B', 2, 1, '2025-05-28 20:00:00', 'finished');

SELECT * FROM users;
drop database chatbot
