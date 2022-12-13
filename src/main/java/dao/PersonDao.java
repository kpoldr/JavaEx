package dao;


import model.EventParticipation;
import model.Person;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class PersonDao {

    private JdbcTemplate template;

    private static final String EVENT_PARTICIPATION_ID = "event_participation_id";
    private static final String PERSON_ID = "person_id";
    private static final String FIRST_NAME = "first_name";
    private static final String LAST_NAME = "last_name";
    private static final String ID_CODE = "id_code";


    public PersonDao(JdbcTemplate template) {
        this.template = template;
    }

    public List<Person> findPersons() {
        var handler = new PersonDao.PersonHandler();
        String sql = "select * from person";

        template.query(sql, handler);
        return handler.getPeople();
    }

    public Person findPersonId(Long id) {
        var handler = new PersonDao.PersonHandler();

        String sql = "select * from person WHERE person.person_id = ?";

        template.query(sql, handler, id);

        return handler.getPeople().get(0);
    }

    public int updatePerson(Person person, Long id) {

        EventParticipation[] participations = person.getEventParticipations();

        if (participations.length == 0) {
            return 400;
        }

        EventParticipation participation = participations[0];

        // Bad solution, but couldn't get "RETURNING" to work
        String sql = "SELECT COUNT(*) FROM event_participation ep LEFT JOIN person p ON p.person_id = ep.person_id" +
                " WHERE p.id_code = ? AND p.person_id != ? AND ep.event_id = ? ";

        int count = template.queryForObject(sql, Integer.class, person.getIdCode(), person.getId(), id);

        if (count > 0) {
            return 409;
        }

        sql = "UPDATE person SET first_name = ?, last_name = ?, id_code = ? WHERE person_id = ?";

        template.update(sql, person.getFirstName(), person.getLastName(), person.getIdCode(), person.getId());

        sql = "UPDATE event_participation SET num_of_participants = ?, payment_type = ?, extra_info = ? WHERE event_id = ? AND person_id = ?";

        template.update(sql, participation.getNumOfParticipants(), participation.getPaymentType(), participation.getExtraInfo(), id, person.getId());

        return 200;
    }

    public Person insertPerson(Person person) {

        var personData = new BeanPropertySqlParameterSource(person);

        EventParticipation[] participations = person.getEventParticipations();

        String checkPersonSql = "select person_id from person WHERE person.id_code = ?";

        Long personId;

        try {
            personId = template.queryForObject(checkPersonSql, Long.class, person.getIdCode());
        } catch (EmptyResultDataAccessException e) {
            personId = null;
        }

        String checkParticipationSql = "select * from event_participation WHERE event_participation.person_id = ?";

        List<EventParticipation> participationsFromDb;

        try {
            participationsFromDb = template.query(checkParticipationSql, new BeanPropertyRowMapper<>(EventParticipation.class), personId);
        } catch (EmptyResultDataAccessException e) {
            participationsFromDb = null;
        }


        if (participationsFromDb != null && participations != null) {
            for (EventParticipation eventPartDb : participationsFromDb) {

                for (EventParticipation eventPart : participations) {

                    if (eventPart.getEventId().equals(eventPartDb.getEventId())) {

                        //add error
                        return person;
                    }
                }
            }
        }

        if (personId == null) {
            Number personNumber = new SimpleJdbcInsert(template)
                    .withTableName("person")
                    .usingGeneratedKeyColumns(PERSON_ID)
                    .executeAndReturnKey(personData);

            personId = personNumber.longValue();
        }

        person.setId(personId);

        if (participations != null && participations.length > 0) {

            EventParticipation participation = participations[0];

            var participationData = new BeanPropertySqlParameterSource(participation);

            participation.setPersonId(personId);

            Number participationNumber = new SimpleJdbcInsert(template)
                    .withTableName("event_participation")
                    .usingGeneratedKeyColumns(EVENT_PARTICIPATION_ID)
                    .executeAndReturnKey(participationData);

            participation.setId(participationNumber.longValue());

            person.setEventParticipations(new EventParticipation[]{participation});

        }

        return person;
    }


    public void deletePersonId(Long id) {

        String sql = "DELETE from person where person_id = ?";

        template.update(sql, id);

    }


    private class PersonHandler implements RowCallbackHandler {
        private List<Person> people = new ArrayList<>();

        public void processRow(ResultSet rs) throws SQLException {


            while (!rs.isAfterLast()) {

                people.add(new Person(rs.getLong(PERSON_ID),
                        rs.getString(FIRST_NAME),
                        rs.getString(LAST_NAME),
                        rs.getString(ID_CODE),
                        null));

                rs.next();
            }

        }

        public List<Person> getPeople() {
            return people;
        }

    }

}
