package app;

import dao.EventDao;

import model.Event;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

@CrossOrigin
@RestController
public class EventController {
    private EventDao dao;

    public EventController(EventDao dao) {
        this.dao = dao;
    }


    @PostMapping(path="events")
    public Event insertEvent(@RequestBody @Valid Event event)
    {
        return dao.insertEvent(event);
    }


    @GetMapping("events/{id}")
    public Event getById(@PathVariable Long id) {

        return dao.findEventId(id);
    }

    @GetMapping("events")
    public List<Event> getOrders() {
        return dao.findEvents();
    }

    @DeleteMapping("events/{id}")
    public void deletePost(@PathVariable Long id) {

        dao.deleteEventId(id);
    }

}
