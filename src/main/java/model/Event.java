package model;


import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.sql.Timestamp;


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
