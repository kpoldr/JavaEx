package dao;

import model.Event;
import model.EventParticipation;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository

public class
EventDao {

    private JdbcTemplate template;
    private static final String EVENT_ID = "event_id";
    private static final String EVENT_PARTICIPATION_ID = "event_participation_id";
    private static final String PERSON_ID = "person_id";
    private static final String COMPANY_ID = "company_id";
    private static final String NAME = "name";
    private static final String DESCRIPTION = "description";
    private static final String ADDRESS = "address";
    private static final String PRICE = "price";
    private static final String DATE = "date";
    private static final String PAYMENT_TYPE = "payment_type";
    private static final String NUM_OF_PARTS = "num_of_participants";
    private static final String EXTRA_INFO = "extra_info";


    public EventDao(JdbcTemplate template) {
        this.template = template;
    }


    public List<Event> findEvents() {
        var handler = new EventParticipationHandler();
        String sql = "select * from event LEFT JOIN event_participation on event.event_id = event_participation.event_id ORDER BY event.date";
        template.query(sql, handler);
        return handler.getEvents();
    }

    public Event findEventId(Long id) {
        var handler = new EventParticipationHandler();

        String sql = "select * from event LEFT JOIN event_participation on" +
                " event.event_id = event_participation.event_id WHERE event.event_id = ?";

        template.query(sql, handler, id);

        return handler.getEvents().get(0);
    }

    public Event insertEvent(Event event) {

        var data = new BeanPropertySqlParameterSource(event);

        Number number = new SimpleJdbcInsert(template)
                .withTableName("event")
                .usingGeneratedKeyColumns(EVENT_ID)
                .executeAndReturnKey(data);

        event.setId(number.longValue());

        return event;
    }


    public void deleteEventId(Long id) {

        String sql = "DELETE from event where event_id = ?";

        template.update(sql, id);

        sql = "DELETE FROM company c WHERE NOT EXISTS (SELECT 1 FROM event_participation ep WHERE c.company_id = ep.company_id)";

        template.update(sql);

        sql = "DELETE FROM person p WHERE NOT EXISTS (SELECT 1 FROM event_participation ep WHERE p.person_id = ep.person_id)";

        template.update(sql);

    }

    public EventParticipation[] convertPartRows(List<EventParticipation> listEventPart) {
        int partRowSize = listEventPart.size();
        EventParticipation[] eventPart = new EventParticipation[partRowSize];


        for (int i = 0; i < partRowSize; i++) {
            eventPart[i] = listEventPart.get(i);
        }

        return eventPart;
    }

    private class EventParticipationHandler implements RowCallbackHandler {
        private List<Event> events = new ArrayList<>();

        public void processRow(ResultSet rs) throws SQLException {

            List<EventParticipation> eventParticipations = new ArrayList<>();
            long oldEventId = rs.getLong(EVENT_ID);
            String oldEventName = rs.getString(NAME);
            String oldEventDescription = rs.getString(DESCRIPTION);
            Timestamp oldEventDate = rs.getTimestamp(DATE);
            String oldEventAddress = rs.getString(ADDRESS);
            Double oldEventPrice = rs.getDouble(PRICE);
            EventParticipation eventPart;


            while (!rs.isAfterLast()) {

                eventPart = new EventParticipation(
                        rs.getLong(EVENT_PARTICIPATION_ID),
                        rs.getLong(EVENT_ID),
                        rs.getLong(PERSON_ID),
                        null,
                        rs.getLong(COMPANY_ID),
                        null,
                        rs.getLong(NUM_OF_PARTS),
                        rs.getString(PAYMENT_TYPE),
                        rs.getString(EXTRA_INFO));

                if (eventPart.getNumOfParticipants() > 0) {
                    eventParticipations.add(eventPart);
                }

                if (oldEventId == rs.getLong(EVENT_ID)) {

                    if (!rs.isLast()) {
                        rs.next();
                        continue;
                    }
                }



                else {

                    events.add(new Event(oldEventId,
                            oldEventName,
                            oldEventDescription,
                            oldEventDate,
                            oldEventAddress,
                            oldEventPrice,
                            (eventParticipations.size() > 0 ? convertPartRows(eventParticipations) : null)));
                }

                if (rs.isLast()) {
                    events.add(new Event(rs.getLong(EVENT_ID),
                            rs.getString(NAME),
                            rs.getString(DESCRIPTION),
                            rs.getTimestamp(DATE),
                            rs.getString(ADDRESS),
                            rs.getDouble(PRICE),
                            (eventParticipations.size() > 0 ? convertPartRows(eventParticipations) : null)));
                } else {

                    eventParticipations.clear();
                    oldEventId = rs.getLong(EVENT_ID);
                    oldEventName = rs.getString(NAME);
                    oldEventDescription = rs.getString(DESCRIPTION);
                    oldEventDate = rs.getTimestamp(DATE);
                    oldEventAddress = rs.getString(ADDRESS);
                    oldEventPrice = rs.getDouble(PRICE);
                }
            rs.next();
        }
    }

    public List<Event> getEvents() {
        return events;
    }

}
}
