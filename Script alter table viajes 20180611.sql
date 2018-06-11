ALTER TABLE viajes
ADD COLUMN duracion TIME;

UPDATE viajes SET duracion = '02:00:00';

ALTER TABLE viajes
MODIFY COLUMN duracion TIME NOT NULL;