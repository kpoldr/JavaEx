package app;

import dao.EventParticipationDao;
import model.EventParticipation;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
public class EventParticipationController {
    private EventParticipationDao dao;

    public EventParticipationController(EventParticipationDao dao) {
        this.dao = dao;
    }

    @GetMapping("eventparticipation/{id}")
    public List<EventParticipation> getById(@PathVariable Long id) {

        return dao.findParticipantByEventId(id);
    }

    @GetMapping("eventparticipation")
    public List<EventParticipation> getPersons() {
        return dao.findParticipants();
    }

    @GetMapping("eventparticipation/person/{personId}/{eventId}")
    public EventParticipation findPersonParticipationId(@PathVariable Long personId, @PathVariable Long eventId) {

        return dao.findParticipantPersonId(personId, eventId);

    }

    @GetMapping("eventparticipation/company/{companyId}/{eventId}")
    public EventParticipation findCompanyParticipationId(@PathVariable Long companyId, @PathVariable Long eventId) {

        return dao.findParticipantCompanyId(companyId, eventId);

    }

    @DeleteMapping("eventparticipation/person/{personId}/{eventId}")
    public void deletePersonParticipationId(@PathVariable Long personId, @PathVariable Long eventId) {

        dao.deleteEventParticipationPerson(personId, eventId);

    }

    @DeleteMapping("eventparticipation/company/{companyId}/{eventId}")
    public void deleteCompanyParticipationId(@PathVariable Long companyId, @PathVariable Long eventId ) {

        dao.deleteEventParticipationCompany(companyId, eventId);

    }
}
