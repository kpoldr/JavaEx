package dao;


import model.Company;
import model.EventParticipation;
import model.Person;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class EventParticipationDao {

    private JdbcTemplate template;

    private static final String EVENT_PARTICIPATION_ID = "event_participation_id";
    private static final String EVENT_ID = "event_id";
    private static final String PERSON_ID = "person_id";
    private static final String COMPANY_ID = "company_id";
    private static final String PAYMENT_TYPE = "payment_type";
    private static final String NUM_OF_PARTS = "num_of_participants";

    private static final String FIRST_NAME = "first_name";
    private static final String LAST_NAME = "last_name";
    private static final String ID_CODE = "id_code";

    private static final String NAME = "name";
    private static final String REGISTER_CODE = "register_code";

    private static final String EXTRA_INFO = "extra_info";

    public EventParticipationDao(JdbcTemplate template) {
        this.template = template;
    }

    public List<EventParticipation> findParticipants() {
        var handler = new ParticipationHandler();
        String sql = "select * from event_participation ep LEFT JOIN person p ON ep.person_id = p.person_id" +
                " LEFT JOIN company c ON ep.company_id = c.company_id ";
        template.query(sql, handler);

        return handler.getParticipations();
    }

    public EventParticipation findParticipantId(Long id) {
        var handler = new ParticipationHandler();

        String sql = "select * from event_participation ep LEFT JOIN person p ON ep.person_id = p.person_id " +
                "LEFT JOIN company c ON ep.company_id = c.company_id WHERE ep.event_participation_id = ?";

        template.query(sql, handler, id);

        return handler.getParticipations().get(0);
    }

    public List<EventParticipation> findParticipantByEventId(Long id) {
        var handler = new ParticipationHandler();

        String sql = "select * from event_participation ep LEFT JOIN person p ON ep.person_id = p.person_id " +
                "LEFT JOIN company c ON ep.company_id = c.company_id WHERE ep.event_id = ?";

        template.query(sql, handler, id);

        return handler.getParticipations();
    }

    public EventParticipation findParticipantPersonId(Long personId, Long eventId) {
        var handler = new ParticipationHandler();

        String sql = "select * from event_participation ep LEFT JOIN person p ON ep.person_id = p.person_id " +
                "LEFT JOIN company c ON ep.company_id = c.company_id WHERE ep.event_id = ? AND p.person_id = ?";

        template.query(sql, handler, eventId, personId);

        return handler.getParticipations().get(0);
    }

    public EventParticipation findParticipantCompanyId(Long companyId, Long eventId) {
        var handler = new ParticipationHandler();

        String sql = "select * from event_participation ep LEFT JOIN company c ON ep.company_id = c.company_id " +
                "LEFT JOIN person p ON ep.person_id = p.person_id  WHERE ep.event_id = ? AND c.company_id = ?";

        template.query(sql, handler, eventId, companyId);

        return handler.getParticipations().get(0);
    }

    public void deleteEventParticipationPerson(Long personId, Long eventId) {

        String sql = "DELETE from event_participation where person_id = ? AND event_id = ?";

        template.update(sql, personId, eventId);

        sql = "DELETE FROM person p WHERE person_id = ? AND NOT EXISTS (SELECT * FROM event_participation ep WHERE p.person_id = ep.person_id )  ";

        template.update(sql, personId);
    }

    public void deleteEventParticipationCompany(Long companyId, Long eventId) {

        String sql = "DELETE from event_participation WHERE company_id = ? AND event_id = ?";

        template.update(sql, companyId, eventId);

        sql = "DELETE FROM company c WHERE company_id = ? AND NOT EXISTS (SELECT * FROM event_participation ep WHERE c.company_id = ep.company_id )";

        template.update(sql, companyId);
    }

    private class ParticipationHandler implements RowCallbackHandler {
        private List<EventParticipation> participations = new ArrayList<>();
        private boolean doesExist = false;

        public void processRow(ResultSet rs) throws SQLException {

            while (!rs.isAfterLast()) {

                Person person = null;
                Company company = null;

//                personId
//
                if (rs.getLong(PERSON_ID) != 0) {
                    person = new
                            Person(rs.getLong(PERSON_ID),
                            rs.getString(FIRST_NAME),
                            rs.getString(LAST_NAME),
                            rs.getString(ID_CODE),
                            null);
                } else {

                    company = new Company(rs.getLong(COMPANY_ID),
                            rs.getString(NAME),
                            rs.getString(REGISTER_CODE),
                            null);

                }

                doesExist = true;

                participations.add(new EventParticipation(
                        rs.getLong(EVENT_PARTICIPATION_ID),
                        rs.getLong(EVENT_ID),
                        rs.getLong(PERSON_ID),
                        person,
                        rs.getLong(COMPANY_ID),
                        company,
                        rs.getLong(NUM_OF_PARTS),
                        rs.getString(PAYMENT_TYPE),
                        rs.getString(EXTRA_INFO)
                ));
                rs.next();
            }

        }

        public List<EventParticipation> getParticipations() {
            return participations;
        }

        public boolean doesExists() {
            return doesExist;
        }

    }

}
