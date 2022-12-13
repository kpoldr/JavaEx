
# Docs

## Andmebaas

Andmebaasiks on valitud HSQLDB koos PostgreSQL *syntaxiga*. 
HSQLDBd on lihtne jooksutada mälus ning Postgre *syntax* 
annab vajadusel andmebaasi välja vahetada.     


## Model

Modelis on tekitatud olentite struktuuri vastavalt andmebaasile.
Lisatud on piirangud antud ülesandele.

###### Event.java
```
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Event {

    private Long id;

    @NonNull
    @Size(min = 1, max = 64)
    private String name;

    @Size(max = 1000)
    private String description;

    @NonNull
    private Timestamp date;

    @NonNull
    @Size(min = 1, max = 80)
    private String address;

    @Min(0)
    private Double price;

    @Valid
    private EventParticipation[] eventParticipations;

}
```

## JDBC

Springi käivitamiseks on loodud **Initializer** klass, millega anname servletitele 
konfiguratsiooni ning api aadressi.

###### Initializer.java
```
public class Initializer extends AbstractAnnotationConfigDispatcherServletInitializer {
    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class[0];

    }
    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class[] { MvcConfig.class };
    }

    @Override
    protected String[] getServletMappings() {
        return new String[] {"/api/*"};
    }

}
```

**MvcConfig** klassis on tekitatud *datasource*, mille sees täpsustatakse kuidas
serveriga suhelda ning anname instruktsioonid andmebaasi loomiseks.

*JdbcTemplate* annab viisi meie *DAO-del* andmebaasiga suhelda.

*CorsMapping* laseb meil samalt aadressilt saata päringuid. 


###### MvcConfig.java
```
@Configuration
@EnableWebMvc
@PropertySource("classpath:/application.properties")
@ComponentScan(basePackages = {"base.app", "base.model", "base.dao"})
public class MvcConfig implements WebMvcConfigurer {

    @Bean
    public JdbcTemplate getTemplate(DataSource ds) {
        return new JdbcTemplate(ds);
    }

    @Bean
    public DataSource dataSource(Environment env) {
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("org.hsqldb.jdbcDriver");
        ds.setUrl(env.getProperty("hsql.url"));

        var populator = new ResourceDatabasePopulator(
                new ClassPathResource("schema.sql"),
                new ClassPathResource("data.sql"));
        DatabasePopulatorUtils.execute(populator, ds);

        return ds;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedMethods("HEAD", "GET", "POST", "PUT", "DELETE", "PATCH").allowedHeaders("*");
    }

    @Override
    public void configureDefaultServletHandling(
            DefaultServletHandlerConfigurer configurer) {
        configurer.enable();
    }

}
```

## DAO

Enamik DAO ülesandeid on lihtsalt sisestamised, uuendamised ja kustutamised. Kaustatakse *JdbcTemplate* ja *RowMappereid*, et tekitada üks lihtne andmete kättesaamine. 

Näited:

###### CompanyDao.java

```
private JdbcTemplate template;

public List<Company> findCompanies() {
        var handler = new CompanyHandler();
        String sql = "select * from company";
        template.query(sql, handler);

        return handler.getCompanies();
    }
```

```
  private class CompanyHandler implements RowCallbackHandler {
        private List<Company> companies = new ArrayList<>();

        public void processRow(ResultSet rs) throws SQLException {

            while (!rs.isAfterLast()) {

                companies.add(new Company(rs.getLong(COMPANY_ID),
                        rs.getString(NAME),
                        rs.getString(REGISTER_CODE),
                        null));

                rs.next();
            }
        }

        public List<Company> getCompanies() {
            return companies;
        }
    }
```


**EventDaos** on vajalik juurde lisada osavõtjate tabel. Seega üritustel, kus on olemas vähemalt üks osavõtja nendele lisame vastava osavõtja objekti. 


###### EventDao.java

```
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
                } else {

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
```

Üritust kustutades, kontrollime, kas see on ainuke ettevõtete ja inimeste osavõtt. Vastasel juhul kustutame ka nemad andmebaasist.

```
   public void deleteEventId(Long id) {

        String sql = "DELETE from event where event_id = ?";

        template.update(sql, id);

        sql = "DELETE FROM company c WHERE NOT EXISTS (SELECT 1 FROM event_participation ep WHERE c.company_id = ep.company_id)";

        template.update(sql);

        sql = "DELETE FROM person p WHERE NOT EXISTS (SELECT 1 FROM event_participation ep WHERE p.person_id = ep.person_id)";

        template.update(sql);

    }

```

**PersonDaos** on sisestamisel vaja kontrollida, kas inimene juba eksisteerib andmebaasis (vastavalt isikukoodile). Olemasolul, lisame osavõtu temale. Sarnane lahendus on olemas **CompanyDaos**

##### Lühem lahendus on tõenäoliselt olemas, kuid ei saanud PostgreSQL-i returningut tööle

###### PersonDao.java
```
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
```


Uuendamisel muudame ka osavõtu tabeli andmeid. Sarnane lahendus on olemas **CompanyDaos**
##### Nüüd vaadates, siis ma ei tea, miks seda EventParticipationDAOs ei teinud lul

###### PersonDao.java
```
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
```

**EventParticipationDaos** on lisatud spetsiaalsed otsingud.

*findParticipantByEventId* - Leiame kõik ürituse osalejad. Vajalik osalejate vaatamisel 

*findParticipantPersonId* - Leiame ühe ürituse isiku. Vajalik muutmisel

*findParticipantCompanyId* - Leiame ühe ürituse ettevõtte. Vajalik muutmisel

###### EventParticipationDao.java
```

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
```


## Controller

Controllerites valiteerime saadud andmed. Korrektsete andmete puhul saadame need vastavasee DAO-sse.


###### EventController.java
```

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
```

Ebakorretsete andmete puhul on olemas meil **ErrorHandlerController**, millega saadame tagasi vea põhjuse

```
@RestControllerAdvice
public class ErrorHandlerController {


    @ExceptionHandler
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ValidationError handleErrors(Exception e) {

        return new ValidationError("internal Error", new ArrayList<String>(){{add("error");}});
    }

    @ExceptionHandler
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ValidationErrors handleValidationError(
            MethodArgumentNotValidException exception) {

        List<FieldError> errors = exception.getBindingResult().getFieldErrors();

        ValidationErrors result = new ValidationErrors();

        for (FieldError error : errors) {
            result.addFieldError(error);
        }

        return result;
    }

}

```

Kuigi enamikud controllerid on sarnaselt ülesse ehitatud, on meil erandiks isik ja ettevõte. Nendes saadame tagasi HTTP sõnumi 409, kui osaleja on juba üritusel olemas.

###### PersonController.java (sarnane CompanyControlleris)
```
 @PutMapping("people/{id}")
    public ResponseEntity<ValidationError> updatePerson(@RequestBody @Valid Person person, @PathVariable Long id) {

        int response = dao.updatePerson(person, id);

        if (response == 409) {
            ValidationError error = new ValidationError("A person already has that id code", List.of(person.getIdCode()));

            return new ResponseEntity<>( error , HttpStatus.CONFLICT);

        } else if (response == 400) {
            ValidationError error = new ValidationError("Bad request", new ArrayList<>());

            return new ResponseEntity<>( error ,HttpStatus.BAD_REQUEST);
        }

        return null;
    }
```

## Service


*Frontend* suhtleb *backendiga* kasutades Axiost

###### HttpClient.ts
```
import axios from "axios";

export const httpClient = axios.create({
    baseURL: "http://localhost:8080/api/",
    headers: {
    'Accept': 'application/x-www-form-urlencoded, application/json', 
    'Access-Control-Allow-Origin' : '*',
    }
});

export default httpClient;

```  

Kuna kõigil controlleritel on sarnane muster lisame **BaseService.ts** mida teised *serviced* saavad kasutada.

###### HttpClient.ts
```
import httpClient from "./HttpClient";
import type { AxiosError } from "axios";
import { IServiceResult } from "../domain/IServiceResult";


export class BaseService<Tentity> {

  constructor(private path: string) {}
  async getAll(): Promise<Tentity[]> {
    
    try {
      let response = await httpClient.get(`/${this.path}`);

      let res = response.data as Tentity[];

      return res;

    } catch (e) {
      let errorMessage : any = (e as AxiosError).response!.data

      let response = {
          status: (e as AxiosError).response!.status,
          errorMessage: errorMessage.errors.code,
          arguments: errorMessage.errors.arguments,
      };

    }

    return [];
  }

  async get(id: number): Promise<Tentity> {
    let response = await httpClient.get(`/${this.path}/${id}`);
    
    let res = response.data as Tentity;
    return res;
  }

  async add(entity: Tentity): Promise<IServiceResult<void>> {

    let response;
    try {
      response = await httpClient.post(`/${this.path}`, entity);
    } catch (e) {
      
      let errorMessage : any = (e as AxiosError)

      let response = {
          code: errorMessage.response.data.code,
          errorMessages: errorMessage.response.data.arguments,
      };
      
      return {status: errorMessage.response.status, errorMessage: response};
    }

    return {data: response.data, status: response.status};
  }

  async update(id: string, entity: Tentity): Promise<IServiceResult<void>> {

    let response;
    try {
      response = await httpClient.put(`/${this.path}/${id}`, entity);
    } catch (e) {

      let errorMessage : any = (e as AxiosError)

      let response = {
          code: errorMessage.response.data.code,
          errorMessages: errorMessage.response.data.arguments,
      };
      
      return {status: errorMessage.response.status, errorMessage: response};
    }

    return { status: 200 };
  }

  async delete(id: number): Promise<IServiceResult<void>> {

    let response;

    try {
      response = await httpClient.delete(`/${this.path}/${id}`);
    } catch (e) {
      
      let errorMessage : any = (e as AxiosError)

      let error = {
          code: errorMessage.response.data.code,
          errorMessages: errorMessage.response.data.arguments,
      };
      
      return {status: errorMessage.response.status, errorMessage: error};
    }

    return { status: 200 };
  }
}


```  

### React

React on ülesse ehitatud koos MUI-ga. Ei ole olemas eraldi *store* (nt redux), vaid tavaline state managment. Sisestamisel on tavaline pikkuse ja lihtne korrektsuse kontrollimine. Ainukeseks erandiks isikukood.

```  
const CheckIdCode = (idCode: string) => {
    let controlNumber = 0;
    let counter = 0;

    for (let i = 0; i < 10; i++) {
      if (i + 1 >= 10) {
        counter = i - 8;
      } else {
        counter = i + 1;
      }

      controlNumber += parseInt(idCode[i]) * counter;
    }

    let moduloNumber = controlNumber % 11;

    if (moduloNumber < 9) {
      if (parseInt(idCode[10]) === moduloNumber) {
        return true;
      }

      return false;
    }

    controlNumber = 0;

    for (let i = 0; i < 10; i++) {
      if (i + 3 >= 10) {
        counter = i - 6;
      } else {
        counter = i + 3;
      }

      controlNumber += parseInt(idCode[i]) * counter;
    }

    if (moduloNumber < 9) {
      if (parseInt(idCode[10]) === moduloNumber) {
        return true;
      }
    }

    if (parseInt(idCode[10]) === 0) {
      return true;
    }

    return false;
  };
```  

## Muu

Ajaliimidi tõttu on asju mida saaks paremini teha. 

* Testimine backendis
* Isikukoodi kontroll võiks olemas olla ka backendil
* Mitme SQL-i lause üheks kokkupanemine, et vähendada päringuid
* Mõnes kohas funktsioonid liiga pikad

Backendi oleks võinud ka ülesse ehitada JPA-ga, mis oleks lihtsustanud selle backendi ehitamist.

