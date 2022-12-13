package model;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventParticipation {

    private Long id;
    private Long eventId;

    private Long personId;
    private Person person;

    private Long companyId;
    private Company company;

    private Long numOfParticipants;

    @Size(min = 1, max = 64)
    private String paymentType;

    @Size(max = 5000)
    private String extraInfo;




}
